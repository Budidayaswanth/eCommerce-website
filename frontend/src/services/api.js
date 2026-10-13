import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Auto-Refresh and error handling
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.accessToken || data.token;
        if (newAccessToken) {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
          if (data.refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
          }
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Categorize error status based on response, DB, or network
    if (!error.response) {
      // True network failure / server offline
      error.status = 'NO_NETWORK';
      error.isNetworkError = true;
      error.message = !navigator.onLine
        ? 'No Internet Connection. You are currently offline.'
        : 'Server Unreachable. Unable to establish connection to Leo Paints backend.';
    } else {
      const respData = error.response.data;
      const httpStatus = error.response.status;

      // Retain backend's structured status if present
      if (respData && respData.status) {
        error.status = respData.status;
        error.message = respData.message || error.message;
      } else if (httpStatus === 503) {
        error.status = 'DB_CONNECTION_ERROR';
        error.message = respData?.message || 'Database connection error. Service temporarily unavailable.';
      } else if (httpStatus >= 500) {
        error.status = 'SERVER_ERROR';
        error.message = respData?.message || 'Internal server error occurred.';
      } else if (httpStatus === 429) {
        error.status = 'RATE_LIMITED';
        error.message = respData?.message || 'Too many requests. Please slow down.';
      } else if (httpStatus === 404) {
        error.status = 'RESOURCE_NOT_FOUND';
      } else if (httpStatus === 400) {
        error.status = 'BAD_REQUEST';
      } else if (httpStatus === 403) {
        error.status = 'FORBIDDEN';
      }
    }

    return Promise.reject(error);
  }
);

// Method to verify live backend & DB health
api.checkHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return {
      isOnline: true,
      dbStatus: response.data?.data?.dbStatus || 'UP',
      serverStatus: 'UP',
      status: response.data?.status || 'DB_CONNECTED',
      message: response.data?.message || 'Database connection healthy',
    };
  } catch (err) {
    return {
      isOnline: navigator.onLine,
      dbStatus: err.status === 'DB_CONNECTION_ERROR' ? 'DOWN' : 'UNKNOWN',
      serverStatus: err.status === 'NO_NETWORK' ? 'DOWN' : 'UP',
      status: err.status || 'NO_NETWORK',
      message: err.message || 'Unable to communicate with server',
    };
  }
};

export default api;
