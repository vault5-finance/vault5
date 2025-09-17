const { User, Account, Transaction, Goal, Loan, Investment, Lending } = require('../models');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Dashboard data
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Net worth: accounts balance + investments - loans
    const accounts = await Account.find({ user: userId });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const investments = await Investment.find({ user: userId });
    const totalInvestments = investments.reduce((sum, inv) => sum + inv.currentValue, 0);

    const loans = await Loan.find({ user: userId, status: 'active' });
    const totalLoans = loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);

    const netWorth = totalBalance + totalInvestments - totalLoans;

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

    const avgCompliance = accounts.reduce((sum, acc) => {
      let score = 50;
      if (acc.status === 'green' || acc.status === 'blue') score = 100;
      if (acc.status === 'red') score = 0;
      return sum + score;
    }, 0) / accounts.length;

    const lendings = await Lending.find({ user: userId });
    const repaidLendings = lendings.filter(l => l.status === 'repaid').length;
    const lendingScore = lendings.length > 0 ? (repaidLendings / lendings.length * 100) : 100;

    const healthScore = ((avgGoalProgress + avgCompliance + lendingScore) / 3).toFixed(2);

    res.json({
      netWorth,
      allocationData,
      healthScore,
      totalBalance,
      totalInvestments,
      totalLoans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate cash flow report (weekly/monthly/yearly)
const getCashFlowReport = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query; // weekly, monthly, yearly
    const userId = req.user._id;
    const now = new Date();
    let startDate;

    if (period === 'weekly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
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
      { $addFields: { shortfall: { $cond: [{ $lt: ['$balance', '$target'] }, { $subtract: ['$target', '$balance'] }, 0] } } }
    ]);

    const debtHistory = missedDeposits.filter(acc => acc.shortfall > 0);

    const surplusHistory = await Transaction.find({ user: userId, type: 'surplus' }).sort({ date: -1 });

    const lendingHistory = await Lending.find({ user: userId }).sort({ createdAt: -1 });

    res.json({
      period,
      startDate,
      income,
      expenses,
      netCashFlow,
      missedDeposits: debtHistory,
      surplusHistory,
      lendingHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export report to PDF
const exportToPDF = async (req, res) => {
  try {
    const { reportType = 'cashflow' } = req.query;
    const reportData = await getCashFlowReportData(req.user._id, reportType); // Helper to get data

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="vault5-${reportType}-report.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).text('Vault5 Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${reportType.toUpperCase()}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    if (reportType === 'cashflow') {
      doc.moveDown();
      doc.text(`Income: KES ${reportData.income.toFixed(2)}`);
      doc.text(`Expenses: KES ${reportData.expenses.toFixed(2)}`);
      doc.text(`Net Cash Flow: KES ${reportData.netCashFlow.toFixed(2)}`);

      doc.moveDown();
      doc.text('Missed Deposits:');
      reportData.missedDeposits.forEach(dep => {
        doc.text(`${dep.accountType}: KES ${dep.shortfall.toFixed(2)}`);
      });

      doc.moveDown();
      doc.text('Surplus History:');
      reportData.surplusHistory.forEach(sur => {
        doc.text(`${sur.description}: KES ${sur.amount.toFixed(2)} on ${sur.date.toLocaleDateString()}`);
      });

      doc.moveDown();
      doc.text('Lending History:');
      reportData.lendingHistory.forEach(lend => {
        doc.text(`${lend.borrowerName} - ${lend.type}: KES ${lend.amount.toFixed(2)} (${lend.status})`);
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper for report data (simplified)
const getCashFlowReportData = async (userId, type) => {
  // Similar to getCashFlowReport but return data instead of json
  // Implementation as in getCashFlowReport, return the computed data
  const { income, expenses, netCashFlow, missedDeposits, surplusHistory, lendingHistory } = await getCashFlowReport({ user: { _id: userId } }, {}, (err) => {}); // Mock
  return { income, expenses, netCashFlow, missedDeposits, surplusHistory, lendingHistory };
};

// Export to Excel
const exportToExcel = async (req, res) => {
  try {
    const { reportType = 'cashflow' } = req.query;
    const reportData = await getCashFlowReportData(req.user._id, reportType);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportType);

    if (reportType === 'cashflow') {
      worksheet.columns = [
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Amount (KES)', key: 'amount', width: 15 },
        { header: 'Date', key: 'date', width: 15 }
      ];

      worksheet.addRow(['Income', reportData.income, new Date()]);
      worksheet.addRow(['Expenses', reportData.expenses, new Date()]);
      worksheet.addRow(['Net Cash Flow', reportData.netCashFlow, new Date()]);

      worksheet.addRow([]); // Blank row

      reportData.missedDeposits.forEach(dep => {
        worksheet.addRow(['Missed Deposit', dep.shortfall, new Date()]);
      });

      reportData.surplusHistory.forEach(sur => {
        worksheet.addRow(['Surplus', sur.amount, sur.date]);
      });

      reportData.lendingHistory.forEach(lend => {
        worksheet.addRow(['Lending', lend.amount, lend.createdAt]);
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
  exportToPDF,
  exportToExcel
};