import axios from 'axios';
import { getOrCreateDeviceId } from '../utils/device';

const API_BASE_URL = (() => {
  // Priority 1: Explicit env
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  // Priority 2: Host-aware defaults
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;

    // If frontend runs on Vercel, default to Render backend
    if (host.endsWith('.vercel.app') || host === 'vault5.vercel.app') {
      return 'https://vault5.onrender.com';
    }

    // In production on non-localhost (and not on Vercel), use relative base to allow reverse proxy/rewrite
    if (host !== 'localhost') {
      return '';
    }
  }

  // Fallback: local dev API
  return 'http://localhost:5000';
})();

// Diagnostic: log resolved baseURL (helps verify Vercel -> Render wiring)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('[Vault5] API baseURL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Request interceptor to add auth token and device id
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Attach stable device identifier for trusted device checks
  try {
    const deviceId = getOrCreateDeviceId();
    if (deviceId) {
      config.headers['X-Device-Id'] = deviceId;
    }
  } catch {
    // no-op
  }
  return config;
});

// Response interceptor with retry logic for network errors and 5xx
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle 401 (unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Retry logic for network errors or 5xx server errors
    if (
      config &&
      !config._retry &&
      (error.code === 'NETWORK_ERROR' || (error.response && error.response.status >= 500))
    ) {
      config._retry = true;
      config._retryCount = config._retryCount || 0;

      if (config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;
        const delay = RETRY_DELAY * Math.pow(2, config._retryCount - 1); // Exponential backoff
        console.log(`Retrying request (${config._retryCount}/${MAX_RETRIES}) after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;