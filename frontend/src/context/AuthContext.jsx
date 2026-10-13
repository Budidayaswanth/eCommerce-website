import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  isLoginModalOpen: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_INIT':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        isAdmin: action.payload.user?.role === 'ADMIN',
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isAdmin: action.payload.user?.role === 'ADMIN',
        isLoginModalOpen: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      };
    case 'SET_LOGIN_MODAL':
      return {
        ...state,
        isLoginModalOpen: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize Auth State from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = authService.getCurrentUser();

      if (storedToken && storedUser) {
        dispatch({
          type: 'AUTH_INIT',
          payload: { user: storedUser, token: storedToken },
        });
      } else {
        dispatch({
          type: 'AUTH_INIT',
          payload: { user: null, token: null },
        });
      }
    } catch {
      dispatch({
        type: 'AUTH_INIT',
        payload: { user: null, token: null },
      });
    }

    const handleExternalLogout = () => {
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('auth:logout', handleExternalLogout);
    return () => window.removeEventListener('auth:logout', handleExternalLogout);
  }, []);

  const sendOtp = async (phone) => {
    try {
      return await authService.sendOtp(phone);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
      throw err;
    }
  };

  const resendOtp = async (phone) => {
    try {
      const res = await authService.resendOtp(phone);
      toast.success('New OTP sent successfully!');
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
      throw err;
    }
  };

  const verifyOtp = async ({ phone, otp, name, email }) => {
    try {
      const res = await authService.verifyOtp({ phone, otp, name, email });
      if (res.user) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: res.user, token: res.accessToken },
        });
        toast.success(`Welcome back, ${res.user.name || 'Painter'}!`);
      }
      return res;
    } catch (err) {
      toast.error(err.message || 'Verification failed');
      throw err;
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const res = await authService.adminLogin(email, password);
      if (res.user) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: res.user, token: res.accessToken },
        });
        toast.success('Admin login successful!');
      }
      return res;
    } catch (err) {
      toast.error(err.message || 'Admin authentication failed');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedFields) => {
    const updated = { ...state.user, ...updatedFields };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    dispatch({ type: 'UPDATE_USER', payload: updatedFields });
    toast.success('Profile updated');
  };

  const openLoginModal = () => dispatch({ type: 'SET_LOGIN_MODAL', payload: true });
  const closeLoginModal = () => dispatch({ type: 'SET_LOGIN_MODAL', payload: false });

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.isAdmin,
    isLoading: state.isLoading,
    isLoginModalOpen: state.isLoginModalOpen,
    sendOtp,
    resendOtp,
    verifyOtp,
    adminLogin,
    logout,
    updateUser,
    openLoginModal,
    closeLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
