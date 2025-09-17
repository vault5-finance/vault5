import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import api from './api';

class ForecastingService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
  }

  // Fetch historical transaction data for forecasting
  async fetchHistoricalData(months = 12) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const response = await api.get('/transactions', {
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

  // Prepare time-series data from transactions
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

    // Create sequences for training
    const sequences = [];
    const targets = [];

    for (let i = windowSize; i < timeSeries.length; i++) {
      const sequence = timeSeries.slice(i - windowSize, i).map(d => d.netCashFlow);
      const target = timeSeries[i].netCashFlow;
      sequences.push(sequence);
      targets.push(target);
    }

    return {
      sequences: tf.tensor2d(sequences),
      targets: tf.tensor1d(targets),
      timeSeries
    };
  }

  // Create and train the forecasting model
  async createModel(inputShape) {
    const model = tf.sequential();

    // LSTM layer for time-series prediction
    model.add(tf.layers.lstm({
      inputShape: [inputShape, 1],
      units: 50,
      returnSequences: false
    }));

    model.add(tf.layers.dense({ units: 25, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });

    this.model = model;
    return model;
  }

  // Train the model
  async trainModel(sequences, targets, epochs = 100) {
    if (!this.model) {
      await this.createModel(sequences.shape[1]);
    }

    // Reshape for LSTM input
    const xs = sequences.reshape([sequences.shape[0], sequences.shape[1], 1]);

    const history = await this.model.fit(xs, targets, {
      epochs,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`);
          }
        }
      }
    });

    this.isModelLoaded = true;
    return history;
  }

  // Generate cash flow projections
  async generateProjections(days = 30, windowSize = 30) {
    if (!this.isModelLoaded) {
      throw new Error('Model not trained yet');
    }

    // Get recent data for prediction
    const recentData = await this.fetchHistoricalData(3); // Last 3 months
    const { sequences } = this.prepareTimeSeriesData(recentData, windowSize);

    // Use the last sequence for prediction
    let currentSequence = sequences.slice([sequences.shape[0] - 1, 0], [1, windowSize]);
    currentSequence = currentSequence.reshape([1, windowSize, 1]);

    const projections = [];

    for (let i = 0; i < days; i++) {
      const prediction = this.model.predict(currentSequence);
      const predictedValue = prediction.dataSync()[0];

      projections.push({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        projectedCashFlow: predictedValue
      });

      // Update sequence for next prediction (simple approach)
      currentSequence = tf.concat([currentSequence.slice([0, 1], [1, windowSize - 1]), prediction.reshape([1, 1, 1])], 1);
    }

    return projections;
  }

  // Full forecasting workflow
  async forecastCashFlow(months = 12, projectionDays = 30) {
    try {
      // Fetch and prepare data
      const transactions = await this.fetchHistoricalData(months);
      const { sequences, targets, timeSeries } = this.prepareTimeSeriesData(transactions);

      if (sequences.shape[0] < 10) {
        throw new Error('Insufficient data for forecasting. Need at least 40 days of transaction data.');
      }

      // Train model
      await this.trainModel(sequences, targets);

      // Generate projections
      const projections = await this.generateProjections(projectionDays);

      return {
        historical: timeSeries,
        projections,
        modelMetrics: {
          trainingDataPoints: sequences.shape[0],
          sequenceLength: sequences.shape[1]
        }
      };
    } catch (error) {
      console.error('Forecasting error:', error);
      throw error;
    }
  }

  // Clean up resources
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isModelLoaded = false;
    }
  }
}

export default new ForecastingService();