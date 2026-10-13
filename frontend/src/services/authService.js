import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

const authService = {
  /**
   * Request OTP for customer login/signup
   * @param {string} phone 10-digit phone number
   */
  async sendOtp(phone) {
    const response = await api.post('/auth/send-otp', { phone });
    // Returns { success: true, status: 'SUCCESS', message: '...', data: { phone, expiresAt, ... } }
    return response.data?.data || response.data;
  },

  /**
   * Resend OTP with server-side cooldown check
   * @param {string} phone 10-digit phone number
   */
  async resendOtp(phone) {
    const response = await api.post('/auth/resend-otp', { phone });
    return response.data?.data || response.data;
  },

  /**
   * Verify customer OTP and obtain real JWT tokens
   */
  async verifyOtp({ phone, otp, name, email }) {
    const response = await api.post('/auth/verify-otp', { phone, otp, name, email });
    const payload = response.data?.data || response.data;

    const token = payload.accessToken || payload.token;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      if (payload.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken);
      }
      if (payload.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(payload.user));
      }
    }
    return payload;
  },

  /**
   * Admin authentication using real email & password
   */
  async adminLogin(email, password) {
    const response = await api.post('/auth/admin/login', { email, password });
    const payload = response.data?.data || response.data;

    const token = payload.accessToken || payload.token;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      if (payload.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken);
      }
      if (payload.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(payload.user));
      }
    }
    return payload;
  },

  /**
   * Complete customer registration
   */
  async register(registerData) {
    const response = await api.post('/auth/register', registerData);
    return response.data?.data || response.data;
  },

  /**
   * Refresh JWT access token
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return null;
    const response = await api.post('/auth/refresh-token', { refreshToken });
    const payload = response.data?.data || response.data;
    if (payload?.accessToken || payload?.token) {
      const newToken = payload.accessToken || payload.token;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
      if (payload.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken);
      }
    }
    return payload;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.dispatchEvent(new Event('auth:logout'));
  },

  getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};

export default authService;
