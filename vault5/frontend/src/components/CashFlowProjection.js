import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import forecastingService from '../services/forecasting';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CashFlowProjection = () => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectionDays, setProjectionDays] = useState(30);

  const generateForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await forecastingService.forecastCashFlow(12, projectionDays);
      setForecastData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateForecast();
  }, [projectionDays]);

  const prepareChartData = () => {
    if (!forecastData) return null;

    const historicalDates = forecastData.historical.map(d => d.date);
    const historicalValues = forecastData.historical.map(d => d.netCashFlow);

    const projectionDates = forecastData.projections.map(d => d.date);
    const projectionValues = forecastData.projections.map(d => d.projectedCashFlow);

    return {
      labels: [...historicalDates, ...projectionDates],
      datasets: [
        {
          label: 'Historical Cash Flow',
          data: historicalValues,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
        {
          label: 'Projected Cash Flow',
          data: [...Array(historicalValues.length).fill(null), ...projectionValues],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [5, 5],
          tension: 0.1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Cash Flow Forecasting',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Net Cash Flow (KES)',
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-semibold mb-4">AI Cash Flow Forecasting</h2>

      <div className="mb-4">
        <label className="mr-4 text-sm font-medium">Projection Period:</label>
        <select
          value={projectionDays}
          onChange={(e) => setProjectionDays(parseInt(e.target.value))}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>1 Week</option>
          <option value={30}>1 Month</option>
          <option value={90}>3 Months</option>
          <option value={180}>6 Months</option>
        </select>
        <button
          onClick={generateForecast}
          disabled={loading}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
        >
          {loading ? 'Generating...' : 'Refresh Forecast'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {forecastData && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-lg font-semibold text-blue-600">
                {forecastData.projections.slice(0, 7).reduce((sum, p) => sum + p.projectedCashFlow, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Projected Next 7 Days</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-lg font-semibold text-green-600">
                {forecastData.projections.slice(0, 30).reduce((sum, p) => sum + p.projectedCashFlow, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Projected Next 30 Days</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-lg font-semibold text-purple-600">
                {forecastData.modelMetrics.trainingDataPoints}
              </p>
              <p className="text-sm text-gray-600">Training Data Points</p>
            </div>
          </div>

          <div className="h-96">
            <Line data={prepareChartData()} options={chartOptions} />
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Forecast Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Trend Analysis</h4>
                <p className="text-sm text-gray-600">
                  Based on your historical patterns, the model predicts your cash flow trends.
                  The red dashed line shows projected values for the next {projectionDays} days.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Recommendations</h4>
                <p className="text-sm text-gray-600">
                  {forecastData.projections.slice(0, 30).reduce((sum, p) => sum + p.projectedCashFlow, 0) < 0
                    ? 'Projected negative cash flow. Consider reducing expenses or increasing income sources.'
                    : 'Positive cash flow projected. Consider saving or investing surplus funds.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Training AI model and generating forecast...</span>
        </div>
      )}
    </div>
  );
};

export default CashFlowProjection;