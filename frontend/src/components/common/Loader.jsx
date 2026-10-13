import React from 'react';

const Loader = ({ fullPage = false, size = 'md', message = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
          backdropFilter: 'blur(3px)',
        }}
      >
        <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '16px' }}>
          {/* Circular pulse ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid var(--color-secondary)',
              borderTopColor: 'var(--color-primary)',
              animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
            }}
          />
          {/* Logo center */}
          <img
            src="/logo.jpg"
            alt="LEO PAINTS"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              padding: '6px',
            }}
          />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-primary-dark)',
            fontWeight: '600',
            fontSize: '1rem',
            letterSpacing: '0.5px',
          }}
        >
          {message}
        </p>
      </div>
    );
  }

  const spinnerSizes = {
    sm: { width: '18px', height: '18px', borderWidth: '2px' },
    md: { width: '32px', height: '32px', borderWidth: '3px' },
    lg: { width: '48px', height: '48px', borderWidth: '4px' },
  };

  const currentSize = spinnerSizes[size] || spinnerSizes.md;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
      }}
    >
      <div
        style={{
          width: currentSize.width,
          height: currentSize.height,
          border: `${currentSize.borderWidth} solid var(--color-primary-subtle)`,
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
