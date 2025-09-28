const { User, Account, Transaction, Goal, Loan, Investment, Lending } = require('../models');
const Wallet = require('../models/Wallet');

// Dashboard data
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Net worth: accounts balance + wallet + investments - loans
    const accounts = await Account.find({ user: userId });
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const walletDoc = await Wallet.findOne({ user: userId }).select('balance');
    const walletBalance = walletDoc?.balance || 0;

    const investments = await Investment.find({ user: userId });
    const totalInvestments = investments.reduce((sum, inv) => sum + inv.currentValue, 0);

    const loans = await Loan.find({ user: userId, status: 'active' });
    const totalLoans = loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);

    const netWorth = totalBalance + walletBalance + totalInvestments - totalLoans;

    // Allocation compliance pie chart data
    const allocationData = accounts.map(acc => ({
      type: acc.type,
      balance: acc.balance,
      percentage: acc.percentage,
      status: acc.status
    }));

    // Financial health score (0-100): average goal progress + compliance (green=100, red=0, blue=100) + lending compliance
    const goals = await Goal.find({ user: userId });
    const avgGoalProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount * 100), 0) / goals.length : 0;

    const avgCompliance = accounts.length > 0
      ? accounts.reduce((sum, acc) => {
          let score = 50;
          if (acc.status === 'green' || acc.status === 'blue') score = 100;
          if (acc.status === 'red') score = 0;
          return sum + score;
        }, 0) / accounts.length
      : 100;

    const lendings = await Lending.find({ user: userId });
    const repaidLendings = lendings.filter(l => l.status === 'repaid').length;
    const lendingScore = lendings.length > 0 ? (repaidLendings / lendings.length * 100) : 100;

    const healthScore = ((avgGoalProgress + avgCompliance + lendingScore) / 3).toFixed(2);

    res.json({
      netWorth,
      allocationData,
      healthScore,
      totalBalance,
      walletBalance,
      totalInvestments,
      totalLoans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate cash flow report (weekly/monthly/yearly)
/**
 * Core computation used by reports and exports.
 * Returns plain data; does not write to res.
 */
const computeCashFlowReportData = async (userId, period = 'monthly') => {
  const now = new Date();
  let startDate;

  if (period === 'weekly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  } else if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'yearly') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: startDate }
  }).sort({ date: -1 });

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = income - expenses;

  const missedDeposits = await Account.aggregate([
    { $match: { user: userId } },
    {
      $lookup: {
        from: 'transactions',
        localField: 'transactions',
        foreignField: '_id',
        as: 'trans'
      }
    },
    {
      $addFields: {
        shortfall: {
          $cond: [
            { $lt: ['$balance', '$target'] },
            { $subtract: ['$target', '$balance'] },
            0
          ]
        }
      }
    }
  ]);

  const debtHistory = missedDeposits.filter(acc => acc.shortfall > 0);

  const surplusHistory = await Transaction.find({ user: userId, type: 'surplus' }).sort({ date: -1 });
  const lendingHistory = await Lending.find({ user: userId }).sort({ createdAt: -1 });

  return {
    period,
    startDate,
    income,
    expenses,
    netCashFlow,
    missedDeposits: debtHistory,
    surplusHistory,
    lendingHistory
  };
};

// Generate cash flow report (weekly/monthly/yearly)
const getCashFlowReport = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const userId = req.user._id;
    const data = await computeCashFlowReportData(userId, period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export report to PDF
const exportToPDF = async (req, res) => {
  try {
    const { reportType = 'cashflow', period = 'monthly' } = req.query;
    const userId = req.user._id;

    // Lazy-load pdfkit to avoid startup hard-failure if missing
    let PDFDocument;
    try {
      PDFDocument = require('pdfkit');
    } catch (e) {
      console.error('pdfkit not installed or failed to load:', e?.message || e);
      return res.status(500).json({ message: 'PDF generation library not available' });
    }

    const reportData = await computeCashFlowReportData(userId, period);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="vault5-${reportType}-report.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).text('Vault5 Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${reportType.toUpperCase()}`);
    doc.text(`Period: ${period}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    if (reportType === 'cashflow') {
      doc.moveDown();
      doc.text(`Income: KES ${reportData.income.toFixed(2)}`);
      doc.text(`Expenses: KES ${reportData.expenses.toFixed(2)}`);
      doc.text(`Net Cash Flow: KES ${reportData.netCashFlow.toFixed(2)}`);

      doc.moveDown();
      doc.text('Missed Deposits:');
      reportData.missedDeposits.forEach(dep => {
        doc.text(`${(dep.accountType || dep.type) ?? 'Account'}: KES ${Number(dep.shortfall || 0).toFixed(2)}`);
      });

      doc.moveDown();
      doc.text('Surplus History:');
      reportData.surplusHistory.forEach(sur => {
        const dateStr = sur.date ? new Date(sur.date).toLocaleDateString() : '';
        doc.text(`${sur.description || 'Surplus'}: KES ${Number(sur.amount || 0).toFixed(2)} ${dateStr ? `on ${dateStr}` : ''}`);
      });

      doc.moveDown();
      doc.text('Lending History:');
      reportData.lendingHistory.forEach(lend => {
        doc.text(`${lend.borrowerName || 'Borrower'} - ${lend.type || 'lending'}: KES ${Number(lend.amount || 0).toFixed(2)} (${lend.status || 'status'})`);
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get spending patterns analysis
const getSpendingPatterns = async (req, res) => {
  try {
    const userId = req.user._id;
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    if (transactions.length === 0) {
      return res.json({
        categories: {},
        weeklyPatterns: [],
        monthlyTrends: [],
        insights: ['Insufficient data for pattern analysis. Continue using Vault5 to see insights.']
      });
    }

    // Analyze categories
    const categories = {};
    transactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = { total: 0, count: 0, transactions: [] };
      }
      categories[category].total += transaction.amount;
      categories[category].count += 1;
      categories[category].transactions.push(transaction);
    });

    // Calculate weekly patterns
    const weeklyPatterns = Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const dayOfWeek = new Date(transaction.date).getDay();
        weeklyPatterns[dayOfWeek] += transaction.amount;
      }
    });

    // Calculate monthly trends
    const monthlyTrends = {};
    transactions.forEach(transaction => {
      const monthKey = transaction.date.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = { income: 0, expenses: 0 };
      }
      if (transaction.type === 'income') {
        monthlyTrends[monthKey].income += transaction.amount;
      } else {
        monthlyTrends[monthKey].expenses += transaction.amount;
      }
    });

    // Generate insights
    const insights = generateSpendingInsights(categories, weeklyPatterns, monthlyTrends);

    res.json({
      categories,
      weeklyPatterns,
      monthlyTrends,
      insights,
      analysisPeriod: `${months} months`,
      totalTransactions: transactions.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate AI-powered spending insights
const generateSpendingInsights = (categories, weeklyPatterns, monthlyTrends) => {
  const insights = [];

  // Category analysis
  const topCategory = Object.entries(categories)
    .sort(([,a], [,b]) => b.total - a.total)[0];

  if (topCategory) {
    const [categoryName, data] = topCategory;
    const percentage = ((data.total / Object.values(categories).reduce((sum, cat) => sum + cat.total, 0)) * 100).toFixed(1);
    insights.push(`Your biggest expense category is ${categoryName} at KES ${data.total.toFixed(2)} (${percentage}%)`);
  }

  // Weekly pattern analysis
  const peakDay = weeklyPatterns.indexOf(Math.max(...weeklyPatterns));
  const lowDay = weeklyPatterns.indexOf(Math.min(...weeklyPatterns));

  if (peakDay !== -1) {
    insights.push(`You spend the most on ${['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'][peakDay]}`);
  }

  // Trend analysis
  const months = Object.keys(monthlyTrends).sort();
  if (months.length >= 2) {
    const currentMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2];

    const currentExpenses = monthlyTrends[currentMonth].expenses;
    const previousExpenses = monthlyTrends[previousMonth].expenses;

    if (currentExpenses > previousExpenses * 1.1) {
      insights.push('Your expenses increased this month compared to last month. Consider reviewing your budget.');
    } else if (currentExpenses < previousExpenses * 0.9) {
      insights.push('Great job! Your expenses decreased this month. Keep up the good work!');
    }
  }

  return insights;
};

// Helper for report data (simplified)
const getCashFlowReportData = async (userId, period = 'monthly') => {
  // Delegate to the core computation
  return computeCashFlowReportData(userId, period);
};

// Export to Excel
const exportToExcel = async (req, res) => {
  try {
    const { reportType = 'cashflow', period = 'monthly' } = req.query;
    const userId = req.user._id;

    // Lazy-load exceljs to avoid startup hard-failure if missing
    let ExcelJS;
    try {
      ExcelJS = require('exceljs');
    } catch (e) {
      console.error('exceljs not installed or failed to load:', e?.message || e);
      return res.status(500).json({ message: 'Excel export library not available' });
    }

    const reportData = await computeCashFlowReportData(userId, period);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportType);

    if (reportType === 'cashflow') {
      worksheet.columns = [
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Amount (KES)', key: 'amount', width: 18 },
        { header: 'Date', key: 'date', width: 18 }
      ];

      worksheet.addRow(['Income', reportData.income, new Date()]);
      worksheet.addRow(['Expenses', reportData.expenses, new Date()]);
      worksheet.addRow(['Net Cash Flow', reportData.netCashFlow, new Date()]);
      worksheet.addRow([]); // Blank row

      reportData.missedDeposits.forEach(dep => {
        worksheet.addRow(['Missed Deposit', dep.shortfall, new Date()]);
      });

      reportData.surplusHistory.forEach(sur => {
        worksheet.addRow(['Surplus', sur.amount, sur.date || new Date()]);
      });

      reportData.lendingHistory.forEach(lend => {
        worksheet.addRow(['Lending', lend.amount, lend.createdAt || new Date()]);
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="vault5-${reportType}-report.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
  getCashFlowReport,
  getSpendingPatterns,
  exportToPDF,
  exportToExcel
};