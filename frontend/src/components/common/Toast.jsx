import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';

export const Toast = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#1A237E',
          color: '#FFFFFF',
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          borderRadius: 'var(--radius-btn)',
          boxShadow: 'var(--shadow-lg)',
          padding: '12px 16px',
          zIndex: 'var(--z-toast)',
        },
        success: {
          iconTheme: {
            primary: '#FFD700',
            secondary: '#1A237E',
          },
        },
        error: {
          style: {
            background: '#C62828',
            color: '#FFFFFF',
          },
          iconTheme: {
            primary: '#FFFFFF',
            secondary: '#C62828',
          },
        },
      }}
    />
  );
};

export default Toast;
