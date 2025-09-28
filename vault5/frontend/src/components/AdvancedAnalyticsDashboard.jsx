import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  LightBulbIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import forecastingService from '../services/forecasting';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdvancedAnalyticsDashboard = () => {
  const [forecastData, setForecastData] = useState(null);
  const [spendingAnalysis, setSpendingAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('forecast');

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const [forecast, analysis] = await Promise.all([
        forecastingService.forecastCashFlow(12, parseInt(selectedPeriod)),
        api.get('/api/reports/spending-patterns')
      ]);

      setForecastData(forecast);
      setSpendingAnalysis(analysis.data);
      setRecommendations(forecast.recommendations || []);
      setInsights(forecast.insights || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, loadAnalyticsData]);

  const forecastChartData = useMemo(() => {
    if (!forecastData) return null;

    return {
      labels: forecastData.projections.map(p => new Date(p.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Historical Cash Flow',
          data: forecastData.historical.map(h => h.netCashFlow),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Predicted Cash Flow',
          data: [
            forecastData.historical[forecastData.historical.length - 1]?.netCashFlow || 0,
            ...forecastData.projections.map(p => p.predictedCashFlow)
          ],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
          tension: 0.4,
          borderDash: [5, 5]
        }
      ]
    };
  }, [forecastData]);

  const spendingPatternData = useMemo(() => {
    if (!spendingAnalysis) return null;

    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Average Daily Spending',
          data: spendingAnalysis.weeklyPatterns || [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(15, 76, 140, 0.8)',
          borderColor: 'rgba(15, 76, 140, 1)',
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    };
  }, [spendingAnalysis]);

  const categoryData = useMemo(() => {
    if (!spendingAnalysis?.categories) return null;

    const categories = Object.entries(spendingAnalysis.categories).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value.total || 0
    })).filter(cat => cat.value > 0);

    return {
      labels: categories.map(cat => cat.name),
      datasets: [
        {
          data: categories.map(cat => cat.value),
          backgroundColor: [
            'rgba(15, 76, 140, 0.8)',
            'rgba(5, 150, 105, 0.8)',
            'rgba(8, 145, 178, 0.8)',
            'rgba(217, 119, 6, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderWidth: 2
        }
      ]
    };
  }, [spendingAnalysis]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter', size: 12 },
          color: 'rgb(75, 85, 99)'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 76, 140, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(15, 76, 140, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(15, 76, 140, 0.1)' },
        ticks: { color: 'rgb(107, 114, 128)' }
      },
      y: {
        grid: { color: 'rgba(15, 76, 140, 0.1)' },
        ticks: {
          color: 'rgb(107, 114, 128)',
          callback: function(value) {
            return 'KES ' + value.toLocaleString();
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with EMI branding */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Advanced <span style={{ color: 'var(--emi-blue)' }}>Analytics</span>
          </h2>
          <p className="text-gray-600">
            AI-powered insights and forecasting for your financial future
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emi-blue"
          >
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
          </select>
          <button
            onClick={loadAnalyticsData}
            className="p-2 text-emi-blue hover:bg-emi-blue/5 rounded-lg transition-colors"
            title="Refresh Analytics"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      {forecastData && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Current Trend</h3>
              <ArrowTrendingUpIcon className="h-6 w-6 text-emi-blue" />
            </div>
            <p className="text-2xl font-bold text-emi-blue mb-2">
              {forecastData.metrics.averageCashFlow > 0 ? '+' : ''}
              KES {forecastData.metrics.averageCashFlow.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Average daily cash flow</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Confidence</h3>
              <ChartBarIcon className="h-6 w-6 text-emi-teal" />
            </div>
            <p className="text-2xl font-bold text-emi-teal mb-2">
              {Math.round(forecastData.metrics.confidence * 100)}%
            </p>
            <p className="text-sm text-gray-600">Prediction accuracy</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Data Points</h3>
              <CalendarIcon className="h-6 w-6 text-emi-green" />
            </div>
            <p className="text-2xl font-bold text-emi-green mb-2">
              {forecastData.metrics.dataPoints}
            </p>
            <p className="text-sm text-gray-600">Days of history</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Next 30 Days</h3>
              <CurrencyDollarIcon className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600 mb-2">
              KES {forecastData.projections.slice(0, 30).reduce((sum, p) => sum + p.predictedCashFlow, 0).toFixed(0)}
            </p>
            <p className="text-sm text-gray-600">Projected total</p>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <motion.div
        className="flex space-x-1 bg-gray-100 p-1 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { id: 'forecast', label: 'Cash Flow Forecast', icon: ArrowTrendingUpIcon },
          { id: 'patterns', label: 'Spending Patterns', icon: ChartBarIcon },
          { id: 'insights', label: 'AI Insights', icon: LightBulbIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md
              font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white text-emi-blue shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'forecast' && forecastChartData && (
          <motion.div
            key="forecast"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Cash Flow Forecast
            </h3>
            <div className="h-80 mb-6">
              <Line data={forecastChartData} options={chartOptions} />
            </div>

            {/* Forecast Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Next 7 Days</h4>
                <p className="text-2xl font-bold text-blue-600">
                  KES {forecastData.projections.slice(0, 7).reduce((sum, p) => sum + p.predictedCashFlow, 0).toFixed(0)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Next 30 Days</h4>
                <p className="text-2xl font-bold text-green-600">
                  KES {forecastData.projections.slice(0, 30).reduce((sum, p) => sum + p.predictedCashFlow, 0).toFixed(0)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-1">Confidence</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(forecastData.metrics.confidence * 100)}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'patterns' && spendingPatternData && (
          <motion.div
            key="patterns"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Weekly Spending Patterns
              </h3>
              <div className="h-64">
                <Bar data={spendingPatternData} options={chartOptions} />
              </div>
            </div>

            {categoryData && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Spending by Category
                </h3>
                <div className="h-64">
                  <Doughnut
                    data={categoryData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* AI Insights */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                AI-Powered Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-4 rounded-lg border-l-4
                      ${insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                        insight.type === 'success' ? 'bg-green-50 border-green-400' :
                        'bg-blue-50 border-blue-400'}
                    `}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{insight.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-700">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Smart Recommendations
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4
                               bg-gradient-to-r from-gray-50 to-gray-100
                               rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center mr-4
                        ${rec.priority === 'high' ? 'bg-red-100' :
                          rec.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'}
                      `}>
                        <LightBulbIcon className={`
                          h-5 w-5
                          ${rec.priority === 'high' ? 'text-red-600' :
                            rec.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'}
                        `} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <p className="text-sm text-gray-600">{rec.message}</p>
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white
                                 rounded-lg transition-colors hover:scale-105"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      Take Action
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;