import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
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
import { Line } from 'react-chartjs-2';
import {
  Users,
  Zap,
  Database,
  Shield,
  CreditCard,
  HardDrive,
  Bell,
  Settings,
  RefreshCw,
  Search,
  Download,
  Moon,
  Sun,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Server,
  Eye,
  EyeOff,
  Wrench,
  GitBranch,
  ChevronRight,
  ChevronLeft,
  Cpu,
  Activity,
  BarChart3,
  Info,
  X
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Safe trend data with default values
const defaultTrend = [0, 0, 0, 0, 0, 0, 0];

const AdminSystem = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [expandedService, setExpandedService] = useState(null);
  const [showSystemGraphs, setShowSystemGraphs] = useState(false);
  const [logFilter, setLogFilter] = useState('all');

  // Safe system metrics with proper initialization
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: { value: 99.9, trend: [99.8, 99.9, 99.7, 99.9, 99.8, 99.9, 99.9] },
    activeUsers: { value: 1247, trend: [1150, 1180, 1200, 1220, 1235, 1240, 1247] },
    apiCalls: { value: 15420, trend: [14800, 15000, 15200, 15300, 15350, 15400, 15420] },
    cpu: { value: 45, trend: [40, 42, 45, 43, 47, 44, 45] },
    memory: { value: 67, trend: [65, 66, 67, 68, 69, 67, 67] },
    errors: { value: 12, trend: [15, 18, 12, 14, 10, 11, 12] }
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Payment Gateway latency increased', timestamp: new Date() },
    { id: 2, type: 'info', message: 'Database maintenance completed', timestamp: new Date() }
  ]);

  const [logs, setLogs] = useState([
    { id: 1, timestamp: '2025-10-01T15:45:23Z', level: 'info', message: 'API Gateway: New deployment v2.3.1 (success)', source: 'api-gateway' },
    { id: 2, timestamp: '2025-10-01T15:42:15Z', level: 'warning', message: 'Database: High connection pool usage (85%)', source: 'database' },
    { id: 3, timestamp: '2025-10-01T15:38:07Z', level: 'error', message: 'Payment Service: Failed to process transaction TXN-12345', source: 'payment-service' },
    { id: 4, timestamp: '2025-10-01T15:35:42Z', level: 'info', message: 'Auth Service: User authentication successful for user_456', source: 'auth-service' },
    { id: 5, timestamp: '2025-10-01T15:30:18Z', level: 'warning', message: 'File Storage: Upload timeout for file_789.jpg', source: 'file-storage' }
  ]);

  const services = [
    { name: 'Database', status: 'running', uptime: 99.9, icon: Database, responseTime: 45, cpu: 35, memory: 60 },
    { name: 'Authentication', status: 'running', uptime: 99.8, icon: Shield, responseTime: 120, cpu: 25, memory: 40 },
    { name: 'Payment Gateway', status: 'warning', uptime: 98.5, icon: CreditCard, responseTime: 340, cpu: 75, memory: 80 },
    { name: 'File Storage', status: 'running', uptime: 99.9, icon: HardDrive, responseTime: 80, cpu: 30, memory: 55 },
    { name: 'Notifications', status: 'running', uptime: 99.7, icon: Bell, responseTime: 95, cpu: 20, memory: 35 },
    { name: 'Cron Jobs', status: 'running', uptime: 99.6, icon: Settings, responseTime: 60, cpu: 15, memory: 25 }
  ];

  const systemInsights = {
    topErrors: [
      { endpoint: '/api/payments/process', count: 45, status: 500 },
      { endpoint: '/api/loans/approve', count: 23, status: 400 },
      { endpoint: '/api/kyc/verify', count: 18, status: 422 }
    ],
    slowEndpoints: [
      { endpoint: '/api/reports/generate', avgTime: 2450, calls: 156 },
      { endpoint: '/api/analytics/dashboard', avgTime: 1890, calls: 89 },
      { endpoint: '/api/compliance/audit', avgTime: 1650, calls: 34 }
    ],
    recentDeployments: [
      { version: 'v2.3.1', status: 'success', timestamp: '2025-10-01T14:30:00Z' },
      { version: 'v2.3.0', status: 'success', timestamp: '2025-09-30T09:15:00Z' }
    ]
  };

  // Safe trend access helper
  const getSafeTrend = (metric) => {
    return metric?.trend && Array.isArray(metric.trend) ? metric.trend : defaultTrend;
  };

  const loadSystemData = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get('/api/admin/system/health');
      setHealth(res.data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('System health error:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSystemData();

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      setSystemMetrics(prev => {
        if (!prev) return prev;
        
        return {
          uptime: {
            ...prev.uptime,
            trend: [...getSafeTrend(prev.uptime).slice(1), prev.uptime.value + (Math.random() - 0.5) * 0.1]
          },
          activeUsers: {
            ...prev.activeUsers,
            trend: [...getSafeTrend(prev.activeUsers).slice(1), prev.activeUsers.value + Math.floor((Math.random() - 0.5) * 20)]
          },
          apiCalls: {
            ...prev.apiCalls,
            trend: [...getSafeTrend(prev.apiCalls).slice(1), prev.apiCalls.value + Math.floor((Math.random() - 0.5) * 100)]
          },
          cpu: {
            ...prev.cpu,
            trend: [...getSafeTrend(prev.cpu).slice(1), Math.max(0, Math.min(100, prev.cpu.value + (Math.random() - 0.5) * 10))]
          },
          memory: {
            ...prev.memory,
            trend: [...getSafeTrend(prev.memory).slice(1), Math.max(0, Math.min(100, prev.memory.value + (Math.random() - 0.5) * 5))]
          },
          errors: {
            ...prev.errors,
            trend: [...getSafeTrend(prev.errors).slice(1), Math.max(0, prev.errors.value + Math.floor((Math.random() - 0.5) * 3))]
          }
        };
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'down': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleServiceToggle = (serviceName) => {
    setExpandedService(expandedService === serviceName ? null : serviceName);
  };

  // Circular Progress Ring Component
  const CircularProgress = ({ value, size = 80, strokeWidth = 8, color = '#10b981' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{value}%</span>
        </div>
      </div>
    );
  };

  const SparklineChart = ({ data, color }) => {
    const safeData = Array.isArray(data) ? data : defaultTrend;
    
    const chartData = {
      labels: safeData.map((_, i) => i),
      datasets: [{
        data: safeData,
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      elements: {
        point: { radius: 0 }
      }
    };

    return (
      <div className="h-12 w-20">
        <Line data={chartData} options={options} />
      </div>
    );
  };

  const MetricCard = ({ title, value, trend, icon: Icon, color, suffix = '', showProgress, progressValue, subtitle }) => {
    const safeTrend = Array.isArray(trend) ? trend : defaultTrend;
    const safeValue = typeof value === 'number' ? value : 0;

    return (
      <motion.div
        className={`relative overflow-hidden rounded-xl p-6 cursor-pointer transition-all duration-300 ${
          isDarkMode
            ? 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
            : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 shadow-lg hover:shadow-xl'
        }`}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {showProgress ? (
                  <div className="flex items-center gap-4">
                    <CircularProgress
                      value={progressValue}
                      color={progressValue > 95 ? '#10b981' : progressValue > 90 ? '#f59e0b' : '#ef4444'}
                    />
                  </div>
                ) : (
                  <>
                    <CountUp
                      end={safeValue}
                      duration={2}
                      separator=","
                      suffix={suffix}
                    />
                  </>
                )}
              </div>
              {!showProgress && safeTrend.length >= 2 && (
                <div className="flex items-center gap-1">
                  {safeTrend[safeTrend.length - 1] > safeTrend[safeTrend.length - 2] ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {subtitle && (
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {!showProgress && (
            <div className="ml-4">
              <SparklineChart data={safeTrend} color={color.includes('green') ? '#10b981' : color.includes('blue') ? '#3b82f6' : '#8b5cf6'} />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const ServiceCard = ({ service, isExpanded, onToggle }) => {
    const StatusIcon = service.icon;
    const pulseColor = service.status === 'warning' ? 'animate-pulse' : '';

    return (
      <motion.div
        className={`relative rounded-xl border transition-all duration-300 ${
          isDarkMode
            ? 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600'
            : 'bg-white/60 border-gray-200/50 hover:border-gray-300'
        } ${pulseColor} ${service.status === 'warning' ? 'ring-2 ring-yellow-400/50' : ''}`}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="p-4 cursor-pointer"
          onClick={() => onToggle(service.name)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <StatusIcon className={`w-5 h-5 ${getStatusColor(service.status)}`} />
              </div>
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {service.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(service.status)}
                  <span className={`text-sm capitalize ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Uptime</div>
                <div className={`text-lg font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {service.uptime}%
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Response Time</div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {service.responseTime}ms
              </div>
            </div>
            <div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>CPU Usage</div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {service.cpu}%
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 px-4 py-4"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Memory Usage</div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {service.memory}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${service.memory}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Restart</div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      2h ago
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <motion.div
                className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-4`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="md:col-span-9 space-y-6">
              {/* Loading skeleton content */}
              <motion.div
                className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="h-8 bg-gray-300 rounded animate-pulse w-64 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-96"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 bg-gray-300 rounded animate-pulse w-32"></div>
                    <div className="h-8 bg-gray-300 rounded animate-pulse w-8"></div>
                    <div className="h-8 bg-gray-300 rounded animate-pulse w-8"></div>
                    <div className="h-8 bg-gray-300 rounded animate-pulse w-32"></div>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i, index) => (
                  <motion.div
                    key={i}
                    className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-8 bg-gray-300 rounded animate-pulse w-16 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
                      </div>
                      <div className="w-20 h-12 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <motion.div
              className={`sticky top-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-4`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AdminSidebar />
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9 space-y-6">
            {/* Header */}
            <motion.div
              className={`relative overflow-hidden rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <motion.h1
                    className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    System Administration
                  </motion.h1>
                  <motion.p
                    className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Monitor infrastructure, users, and APIs in real-time
                  </motion.p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Last updated: {Math.floor((new Date() - lastUpdated) / 1000)}s ago
                    </span>
                  </div>

                  <motion.button
                    onClick={loadSystemData}
                    disabled={isRefreshing}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </motion.button>

                  <motion.button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard
                title="Server Uptime"
                value={systemMetrics.uptime.value}
                trend={systemMetrics.uptime.trend}
                icon={Server}
                color="text-green-400"
                suffix="%"
                showProgress={true}
                progressValue={systemMetrics.uptime.value}
                subtitle="Last 24 hours"
              />
              <MetricCard
                title="Active Users"
                value={systemMetrics.activeUsers.value}
                trend={systemMetrics.activeUsers.trend}
                icon={Users}
                color="text-blue-400"
                subtitle="Currently online"
              />
              <MetricCard
                title="API Calls/min"
                value={systemMetrics.apiCalls.value}
                trend={systemMetrics.apiCalls.trend}
                icon={Zap}
                color="text-purple-400"
                subtitle="Requests per minute"
              />
              <MetricCard
                title="System Health"
                value={95}
                icon={Activity}
                color="text-emerald-400"
                showProgress={true}
                progressValue={95}
                subtitle="Overall status"
              />
            </div>

            {/* Service Status Grid */}
            <motion.div
              className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Service Status
                </h2>
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {showRawJson ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showRawJson ? 'Hide' : 'Show'} Raw JSON
                </button>
              </div>

              <AnimatePresence mode="wait">
                {!showRawJson ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {services.map((service, index) => (
                      <ServiceCard
                        key={service.name}
                        service={service}
                        isExpanded={expandedService === service.name}
                        onToggle={handleServiceToggle}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="json"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-gray-900/50 rounded-lg p-4 overflow-x-auto"
                  >
                    <pre className="text-sm text-gray-300">
                      {JSON.stringify(health, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystem;