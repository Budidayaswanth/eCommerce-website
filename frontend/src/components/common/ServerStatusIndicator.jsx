import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { RiWifiOffLine, RiDatabase2Line, RiServerLine, RiCheckLine, RiRefreshLine } from 'react-icons/ri';

const ServerStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [health, setHealth] = useState({
    dbStatus: 'UP',
    serverStatus: 'UP',
    status: 'DB_CONNECTED',
    message: '',
  });
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const res = await api.checkHealth();
      setHealth(res);
      setIsOnline(res.isOnline);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();

    const handleOnline = () => {
      setIsOnline(true);
      checkHealth();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHealth((prev) => ({
        ...prev,
        isOnline: false,
        status: 'NO_NETWORK',
        message: 'You are currently offline. Check your internet connection.',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic health ping every 45s
    const interval = setInterval(checkHealth, 45000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Determine if there is an error to alert the user about
  const hasNetworkError = !isOnline || health.status === 'NO_NETWORK';
  const hasDbError = health.dbStatus === 'DOWN' || health.status === 'DB_CONNECTION_ERROR';
  const hasServerError = health.serverStatus === 'DOWN' || health.status === 'SERVER_ERROR';

  if (!hasNetworkError && !hasDbError && !hasServerError) {
    // Normal healthy state - don't show full banner, keep subtle or hidden
    return null;
  }

  if (dismissed) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: hasNetworkError
          ? '#C62828'
          : hasDbError
          ? '#D84315'
          : '#B71C1C',
        color: '#FFFFFF',
        padding: '8px 16px',
        fontSize: '0.8125rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1100,
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {hasNetworkError && <RiWifiOffLine size={18} />}
        {hasDbError && !hasNetworkError && <RiDatabase2Line size={18} />}
        {hasServerError && !hasNetworkError && !hasDbError && <RiServerLine size={18} />}

        <span>
          <strong>
            {hasNetworkError
              ? 'No Network Connection: '
              : hasDbError
              ? 'Database Connection Error: '
              : 'Server Error: '}
          </strong>
          {hasNetworkError
            ? 'You are offline or the server is unreachable.'
            : hasDbError
            ? 'Unable to connect to PostgreSQL database. Retrying...'
            : health.message || 'Server encountered an issue.'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={checkHealth}
          disabled={checking}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#FFFFFF',
            padding: '3px 10px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <RiRefreshLine size={12} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Checking...' : 'Retry'}
        </button>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '1rem',
            lineHeight: 1,
            opacity: 0.8,
          }}
          title="Dismiss warning"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ServerStatusIndicator;
