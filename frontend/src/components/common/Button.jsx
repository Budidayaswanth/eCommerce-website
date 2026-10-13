import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon = null,
  endIcon = null,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  ...props
}) => {
  // Styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#FFFFFF',
          color: 'var(--color-primary)',
          border: '1.5px solid var(--color-primary)',
        };
      case 'accent':
        return {
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-primary-dark)',
          border: 'none',
          fontWeight: '600',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-accent)',
          color: '#FFFFFF',
          border: 'none',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          border: 'none',
        };
    }
  };

  // Styles based on size
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '6px 12px',
          fontSize: '0.8125rem',
          height: '32px',
        };
      case 'lg':
        return {
          padding: '12px 24px',
          fontSize: '1rem',
          height: '48px',
        };
      case 'md':
      default:
        return {
          padding: '8px 18px',
          fontSize: '0.875rem',
          height: '40px',
        };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : 'button')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: 'var(--radius-btn)',
        fontWeight: '500',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all var(--transition-base)',
        whiteSpace: 'nowrap',
        boxShadow: variant === 'primary' || variant === 'accent' ? 'var(--shadow-xs)' : 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
      }}
      className={`btn-common ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            borderTopColor: variant === 'secondary' || variant === 'accent' ? 'var(--color-primary)' : '#FFFFFF',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : (
        icon && <span style={{ display: 'inline-flex', fontSize: '1.1em' }}>{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && endIcon && (
        <span style={{ display: 'inline-flex', fontSize: '1.1em' }}>{endIcon}</span>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .btn-common:hover:not(:disabled) {
          filter: brightness(0.95);
          transform: translateY(-1px);
        }
        .btn-common:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </button>
  );
};

export default Button;
