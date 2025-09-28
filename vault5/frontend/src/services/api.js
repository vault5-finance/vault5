import axios from 'axios';
import { getOrCreateDeviceId } from '../utils/device';

/**
 * API Base URL Configuration with Environment-Aware Fallback Logic
 *
 * Priority order for determining API base URL:
 * 1. REACT_APP_API_URL environment variable (highest priority)
 *    - Set this in Vercel dashboard for production deployments
 *    - Allows overriding for different environments (staging, testing, etc.)
 *
 * 2. Host-aware automatic detection:
 *    - Vercel deployments (*.vercel.app or vault5.vercel.app) → Render backend
 *    - Production domains (non-localhost, non-Vercel) → relative path for reverse proxy
 *    - Supports preview deployments and custom domains
 *
 * 3. Development fallback:
 *    - Localhost defaults to http://localhost:5000 for local development
 *
 * This ensures seamless communication between frontend and backend across:
 * - Local development (localhost)
 * - Vercel production deployments
 * - Vercel preview deployments
 * - Custom production domains with reverse proxies
 */
const API_BASE_URL = (() => {
  // Priority 1: Explicit environment variable override
  if (process.env.REACT_APP_API_URL) {
    console.log('[Vault5] Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // Priority 2: Host-aware automatic detection
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;

    // Vercel deployments (production and preview) → Render backend
    if (host.endsWith('.vercel.app') || host === 'vault5.vercel.app') {
      console.log('[Vault5] Vercel deployment detected, using Render backend');
      return 'https://vault5.onrender.com';
    }

    // Production domains (non-localhost, non-Vercel) → relative path for reverse proxy
    if (host !== 'localhost' && host !== '127.0.0.1') {
      console.log('[Vault5] Production domain detected, using relative path for reverse proxy');
      return '';
    }
  }

  // Priority 3: Local development fallback
  console.log('[Vault5] Local development mode, using localhost backend');
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