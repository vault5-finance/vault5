import api from './api';

class ForecastingService {
  constructor() {
    this.isInitialized = false;
  }

  // Fetch historical transaction data for forecasting
  async fetchHistoricalData(months = 12) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const response = await api.get('/api/transactions', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 1000
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  // Prepare time-series data from transactions using simple statistical approach
  prepareTimeSeriesData(transactions, windowSize = 30) {
    // Group transactions by date and calculate daily net cash flow
    const dailyData = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { income: 0, expenses: 0 };
      }

      if (transaction.type === 'income') {
        dailyData[date].income += transaction.amount;
      } else {
        dailyData[date].expenses += transaction.amount;
      }
    });

    // Convert to array sorted by date
    const sortedDates = Object.keys(dailyData).sort();
    const timeSeries = sortedDates.map(date => ({
      date,
      netCashFlow: dailyData[date].income - dailyData[date].expenses
    }));

    // Calculate simple moving averages for forecasting
    const movingAverages = [];
    for (let i = windowSize; i < timeSeries.length; i++) {
      const window = timeSeries.slice(i - windowSize, i);
      const average = window.reduce((sum, day) => sum + day.netCashFlow, 0) / windowSize;
      movingAverages.push(average);
    }

    return {
      timeSeries,
      movingAverages,
      recentAverage: movingAverages.length > 0 ? movingAverages[movingAverages.length - 1] : 0
    };
  }

  // Simple linear regression for trend analysis
  calculateLinearRegression(data) {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: data[0] || 0 };

    const xSum = data.reduce((sum, _, i) => sum + i, 0);
    const ySum = data.reduce((sum, y) => sum + y, 0);
    const xySum = data.reduce((sum, y, i) => sum + y * i, 0);
    const xSquareSum = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    return { slope, intercept };
  }

  // Generate cash flow projections using statistical methods
  generateProjections(days = 30, timeSeriesData) {
    if (timeSeriesData.length < 7) {
      throw new Error('Insufficient data for forecasting. Need at least 7 days of transaction data.');
    }

    const { timeSeries, movingAverages, recentAverage } = timeSeriesData;

    // Use recent average as baseline
    const baseline = recentAverage;

    // Calculate trend using linear regression on recent data
    const recentData = movingAverages.slice(-14); // Last 2 weeks
    const { slope: trend } = this.calculateLinearRegression(recentData);

    // Calculate seasonal patterns (weekly patterns)
    const weeklyPatterns = this.calculateWeeklyPatterns(timeSeries);

    const projections = [];

    for (let i = 0; i < days; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i + 1);

      // Get day of week for seasonal adjustment
      const dayOfWeek = futureDate.getDay();
      const seasonalAdjustment = weeklyPatterns[dayOfWeek] || 0;

      // Simple projection: baseline + trend * days + seasonal adjustment
      const projectedValue = baseline + (trend * (i + 1)) + seasonalAdjustment;

      projections.push({
        date: futureDate.toISOString().split('T')[0],
        projectedCashFlow: Math.max(0, projectedValue), // Ensure non-negative
        confidence: Math.max(0.3, 0.9 - (i * 0.02)) // Confidence decreases over time
      });
    }

    return projections;
  }

  // Calculate weekly patterns from historical data
  calculateWeeklyPatterns(timeSeries) {
    const weeklyData = [[], [], [], [], [], [], []]; // 7 days of week

    timeSeries.forEach(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      weeklyData[dayOfWeek].push(day.netCashFlow);
    });

    // Calculate average for each day of the week
    const patterns = {};
    weeklyData.forEach((dayData, index) => {
      if (dayData.length > 0) {
        patterns[index] = dayData.reduce((sum, val) => sum + val, 0) / dayData.length;
      } else {
        patterns[index] = 0;
      }
    });

    // Calculate deviations from overall average
    const overallAverage = timeSeries.reduce((sum, day) => sum + day.netCashFlow, 0) / timeSeries.length;
    const deviations = {};

    Object.keys(patterns).forEach(day => {
      deviations[day] = patterns[day] - overallAverage;
    });

    return deviations;
  }

  // Full forecasting workflow using statistical methods
  async forecastCashFlow(months = 12, projectionDays = 30) {
    try {
      // Fetch and prepare data
      const transactions = await this.fetchHistoricalData(months);
      const timeSeriesData = this.prepareTimeSeriesData(transactions);

      if (timeSeriesData.timeSeries.length < 7) {
        throw new Error('Insufficient data for forecasting. Need at least 7 days of transaction data.');
      }

      // Generate projections
      const projections = this.generateProjections(projectionDays, timeSeriesData);

      return {
        historical: timeSeriesData.timeSeries,
        projections,
        methodology: 'Statistical forecasting using moving averages, linear regression, and seasonal patterns',
        metrics: {
          dataPoints: timeSeriesData.timeSeries.length,
          averageCashFlow: timeSeriesData.recentAverage,
          confidence: 'Medium (statistical methods)'
        }
      };
    } catch (error) {
      console.error('Forecasting error:', error);
      throw error;
    }
  }

  // Simple trend analysis
  async getTrendAnalysis(months = 3) {
    try {
      const transactions = await this.fetchHistoricalData(months);
      const timeSeriesData = this.prepareTimeSeriesData(transactions);

      const { slope } = this.calculateLinearRegression(timeSeriesData.movingAverages);

      return {
        trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
        slope: slope,
        average: timeSeriesData.recentAverage,
        dataPoints: timeSeriesData.timeSeries.length
      };
    } catch (error) {
      console.error('Trend analysis error:', error);
      throw error;
    }
  }
}

export default new ForecastingService();