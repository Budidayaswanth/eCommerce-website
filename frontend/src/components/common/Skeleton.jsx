import React from 'react';

const Skeleton = ({
  variant = 'text',
  width = '100%',
  height,
  borderRadius,
  className = '',
  count = 1,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'circle':
        return {
          width: width || '48px',
          height: width || '48px',
          borderRadius: '50%',
        };
      case 'image':
        return {
          width: width || '100%',
          height: height || '200px',
          borderRadius: borderRadius || 'var(--radius-card)',
        };
      case 'card':
        return {
          width: width || '100%',
          height: height || '280px',
          borderRadius: borderRadius || 'var(--radius-card)',
        };
      case 'product-card':
        return {
          width: '100%',
          height: '360px',
          borderRadius: 'var(--radius-card)',
        };
      case 'text':
      default:
        return {
          width,
          height: height || '16px',
          borderRadius: borderRadius || 'var(--radius-xs)',
          marginBottom: '8px',
        };
    }
  };

  if (variant === 'product-card') {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '12px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          className="shimmer"
          style={{
            width: '100%',
            aspectRatio: '1/1',
            borderRadius: 'var(--radius-btn)',
          }}
        />
        <div
          className="shimmer"
          style={{ width: '85%', height: '18px', borderRadius: '4px' }}
        />
        <div
          className="shimmer"
          style={{ width: '40%', height: '14px', borderRadius: '4px' }}
        />
        <div
          className="shimmer"
          style={{ width: '60%', height: '22px', borderRadius: '4px' }}
        />
        <div
          className="shimmer"
          style={{ width: '100%', height: '36px', borderRadius: '8px' }}
        />
      </div>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`shimmer ${className}`}
          style={{
            display: 'block',
            ...getStyles(),
          }}
        />
      ))}
    </>
  );
};

export default Skeleton;
