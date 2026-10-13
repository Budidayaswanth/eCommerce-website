import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      value,
      onChange,
      error,
      helperText,
      icon,
      required = false,
      rows = 3,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const isTextarea = type === 'textarea';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }} className={className}>
        {label && (
          <label
            htmlFor={name}
            style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: error ? 'var(--color-danger)' : 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          </label>
        )}

        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <div
              style={{
                position: 'absolute',
                left: '12px',
                color: error ? 'var(--color-danger)' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              {icon}
            </div>
          )}

          {isTextarea ? (
            <textarea
              ref={ref}
              id={name}
              name={name}
              rows={rows}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              style={{
                width: '100%',
                padding: '10px 14px',
                paddingLeft: icon ? '40px' : '14px',
                borderRadius: 'var(--radius-btn)',
                border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
                backgroundColor: disabled ? 'var(--color-bg-muted)' : '#FFFFFF',
                color: 'var(--color-text-primary)',
                fontSize: '0.9375rem',
                lineHeight: 1.5,
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                resize: 'vertical',
              }}
              className="input-field"
              {...props}
            />
          ) : (
            <input
              ref={ref}
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 14px',
                paddingLeft: icon ? '40px' : '14px',
                borderRadius: 'var(--radius-btn)',
                border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
                backgroundColor: disabled ? 'var(--color-bg-muted)' : '#FFFFFF',
                color: 'var(--color-text-primary)',
                fontSize: '0.9375rem',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              className="input-field"
              {...props}
            />
          )}
        </div>

        {error && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-danger)',
              marginTop: '2px',
            }}
          >
            {error}
          </span>
        )}

        {!error && helperText && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              marginTop: '2px',
            }}
          >
            {helperText}
          </span>
        )}

        <style>{`
          .input-field:focus {
            border-color: var(--color-primary) !important;
            box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.15) !important;
          }
        `}</style>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
