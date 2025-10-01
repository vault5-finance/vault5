import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountUp } from 'react-countup';
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
  GitBranch
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

const AdminSystem = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
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

  const [expandedService, setExpandedService] = useState(null);
  const [showSystemGraphs, setShowSystemGraphs] = useState(false);

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

  const loadSystemData = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get('/api/admin/system/health');
      setHealth(res.data);
      setLastUpdated(new Date());

      // Simulate real-time metrics updates
      setSystemMetrics(prev => ({
        uptime: { ...prev.uptime, value: 99.9 + Math.random() * 0.1 },
        activeUsers: { ...prev.activeUsers, value: Math.floor(1200 + Math.random() * 100) },
        apiCalls: { ...prev.apiCalls, value: Math.floor(15000 + Math.random() * 1000) }
      }));
    } catch (e) {
      console.error('System health error:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSystemData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // Update metrics with slight variations
      setSystemMetrics(prev => ({
        uptime: {
          ...prev.uptime,
          trend: [...prev.uptime.trend.slice(1), prev.uptime.value + (Math.random() - 0.5) * 0.1]
        },
        activeUsers: {
          ...prev.activeUsers,
          trend: [...prev.activeUsers.trend.slice(1), prev.activeUsers.value + Math.floor((Math.random() - 0.5) * 20)]
        },
        apiCalls: {
          ...prev.apiCalls,
          trend: [...prev.apiCalls.trend.slice(1), prev.apiCalls.value + Math.floor((Math.random() - 0.5) * 100)]
        },
        cpu: {
          ...prev.cpu,
          trend: [...prev.cpu.trend.slice(1), Math.max(0, Math.min(100, prev.cpu.value + (Math.random() - 0.5) * 10))]
        },
        memory: {
          ...prev.memory,
          trend: [...prev.memory.trend.slice(1), Math.max(0, Math.min(100, prev.memory.value + (Math.random() - 0.5) * 5))]
        },
        errors: {
          ...prev.errors,
          trend: [...prev.errors.trend.slice(1), Math.max(0, prev.errors.value + Math.floor((Math.random() - 0.5) * 3))]
        }
      }));
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
    const chartData = {
      labels: data.map((_, i) => i),
      datasets: [{
        data: data,
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

  // System Health Chart Component
  const SystemHealthChart = ({ data, title, color, isDarkMode }) => {
    const chartData = {
      labels: data.labels,
      datasets: [{
        label: title,
        data: data.values,
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
          titleColor: isDarkMode ? '#ffffff' : '#000000',
          bodyColor: isDarkMode ? '#ffffff' : '#000000',
        }
      },
      scales: {
        x: {
          display: false,
          grid: { display: false }
        },
        y: {
          display: false,
          grid: { display: false }
        }
      },
      elements: {
        point: {
          radius: 0,
          hoverRadius: 4
        }
      }
    };

    return (
      <div className="h-32">
        <Line data={chartData} options={options} />
      </div>
    );
  };

  const MetricCard = ({ title, value, trend, icon: Icon, color, suffix = '', showProgress, progressValue, subtitle }) => {
    const { countUpRef } = useCountUp({
      end: value,
      duration: 2,
      separator: ","
    });

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
                    <span ref={countUpRef} />
                    {suffix}
                  </>
                )}
              </div>
              {!showProgress && trend && (
                <div className="flex items-center gap-1">
                  {trend[trend.length - 1] > trend[trend.length - 2] ? (
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
              <SparklineChart data={trend} color={color.includes('green') ? '#10b981' : color.includes('blue') ? '#3b82f6' : '#8b5cf6'} />
            </div>
          )}
        </div>

        {/* Hover tooltip */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
          initial={false}
          whileHover={{ opacity: 1 }}
        />
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

                <div className="pt-3 border-t border-gray-200">
                  <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Recent Logs
                  </h5>
                  <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                    <div>2025-10-01 17:45:23 - Service started successfully</div>
                    <div>2025-10-01 17:30:15 - Health check passed</div>
                    <div>2025-10-01 17:15:07 - Configuration updated</div>
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
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <div className={`animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg h-96`} />
            </div>
            <div className="md:col-span-9 space-y-6">
              <div className={`animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg h-20`} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg h-32`} />
                ))}
              </div>
              <div className={`animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg h-64`} />
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
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

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
            {/* Enhanced Header */}
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
                  {/* Real-time sync indicator */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Last updated: {Math.floor((new Date() - lastUpdated) / 1000)}s ago
                    </span>
                  </div>

                  {/* Refresh button */}
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

                  {/* Theme toggle */}
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

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search systems..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>

                  {/* Export button */}
                  <motion.button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Metrics Cards */}
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

            {/* Alert Notifications Banner */}
            {alerts.length > 0 && (
              <motion.div
                className={`rounded-xl ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${isDarkMode ? 'border-red-800' : 'border-red-200'} p-4`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertIcon className="w-5 h-5 text-red-600" />
                  <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    System Alerts ({alerts.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                        {alert.message}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* System Health Graphs */}
            <motion.div
              className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    System Health Monitoring
                  </h2>
                </div>
                <motion.button
                  onClick={() => setShowSystemGraphs(!showSystemGraphs)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showSystemGraphs ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {showSystemGraphs ? 'Hide' : 'Show'} Graphs
                </motion.button>
              </div>

              <AnimatePresence>
                {showSystemGraphs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Cpu className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>CPU Usage</span>
                      </div>
                      <SystemHealthChart
                        data={{
                          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                          values: systemMetrics.cpu.trend
                        }}
                        title="CPU %"
                        color="#3b82f6"
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <HDD className="w-4 h-4 text-green-500" />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Memory Usage</span>
                      </div>
                      <SystemHealthChart
                        data={{
                          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                          values: systemMetrics.memory.trend
                        }}
                        title="Memory %"
                        color="#10b981"
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Error Rate</span>
                      </div>
                      <SystemHealthChart
                        data={{
                          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                          values: systemMetrics.errors.trend
                        }}
                        title="Errors"
                        color="#ef4444"
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

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
                <div className="flex items-center gap-2">
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

            {/* System Insights */}
            <motion.div
              className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                System Insights
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Errors */}
                <div className={`rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-red-50'} p-4`}>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Top Errors (24h)
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {systemInsights.topErrors.map((error, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {error.endpoint}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Status {error.status}
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                          {error.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slow Endpoints */}
                <div className={`rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-yellow-50'} p-4`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Slow Endpoints
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {systemInsights.slowEndpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {endpoint.endpoint}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {endpoint.calls} calls
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          {endpoint.avgTime}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Deployments */}
                <div className={`rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-green-50'} p-4`}>
                  <div className="flex items-center gap-2 mb-4">
                    <GitBranch className="w-5 h-5 text-green-400" />
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Recent Deployments
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {systemInsights.recentDeployments.map((deployment, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {deployment.version}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(deployment.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className={`flex items-center ${deployment.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                          {deployment.status === 'success' ?
                            <CheckCircle className="w-4 h-4" /> :
                            <XCircle className="w-4 h-4" />
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Maintenance Mode Toggle */}
            <motion.div
              className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wrench className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <div>
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Maintenance Mode
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Put the system into safe mode for maintenance
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    maintenanceMode ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystem;