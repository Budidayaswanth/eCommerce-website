import React from 'react';

const Badge = ({
  children,
  variant = 'info',
  size = 'md',
  discountPercentage,
  className = '',
  style = {},
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'discount':
        return {
          backgroundColor: 'var(--color-accent)',
          color: '#FFFFFF',
          fontWeight: '700',
          letterSpacing: '0.5px',
          boxShadow: '0 2px 6px rgba(198, 40, 40, 0.3)',
        };
      case 'success':
        return {
          backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          fontWeight: '600',
        };
      case 'warning':
        return {
          backgroundColor: 'var(--color-warning-bg)',
          color: 'var(--color-warning)',
          fontWeight: '600',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          fontWeight: '600',
        };
      case 'gold':
      case 'accent':
        return {
          backgroundColor: 'var(--color-secondary-light)',
          color: '#7B5E00',
          fontWeight: '700',
        };
      case 'info':
      default:
        return {
          backgroundColor: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
          fontWeight: '600',
        };
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isSmall ? '2px 6px' : '4px 10px',
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        borderRadius: 'var(--radius-xs)',
        textTransform: 'uppercase',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...getStyles(),
        ...style,
      }}
      className={`badge-item ${className}`}
    >
      {variant === 'discount' && discountPercentage ? `-${discountPercentage}% OFF` : children}
    </span>
  );
};

export default Badge;
