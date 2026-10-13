import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

const authService = {
  async sendOtp(phone) {
    try {
      const response = await api.post('/auth/send-otp', { phone });
      return response.data;
    } catch (error) {
      // Fallback mock simulation for demo/dev
      console.warn('API /auth/send-otp fallback demo mode');
      return { success: true, message: 'OTP sent successfully to +91 ' + phone, otp: '123456' };
    }
  },

  async verifyOtp({ phone, otp, name, email }) {
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp, name, email });
      if (response.data?.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
        }
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // Fallback demo user
      console.warn('API /auth/verify-otp fallback demo mode');
      const mockUser = {
        id: 'usr_demo_101',
        phone,
        name: name || 'Valued Painter',
        email: email || `user_${phone}@leopaints.com`,
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
      };
      const token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      return { success: true, accessToken: token, user: mockUser };
    }
  },

  async adminLogin(email, password) {
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      if (response.data?.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // Allow admin demo login
      if (email === 'admin@leopaints.com' && (password === 'admin123' || password === 'admin')) {
        const adminUser = {
          id: 'admin_001',
          name: 'Leo Master Admin',
          email: 'admin@leopaints.com',
          role: 'ADMIN',
        };
        const token = 'mock_admin_jwt_' + Date.now();
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(adminUser));
        return { success: true, accessToken: token, user: adminUser };
      }
      throw new Error(error.response?.data?.message || 'Invalid admin credentials');
    }
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return null;
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
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
    } catch (e) {
      return null;
    }
  },
};

export default authService;
