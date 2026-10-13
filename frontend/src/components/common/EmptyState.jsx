import React from 'react';
import Button from './Button';
import { RiShoppingBagLine } from 'react-icons/ri';

const EmptyState = ({
  icon,
  title = 'No Items Found',
  subtitle = 'Looks like there is nothing to show here right now.',
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-card)',
        margin: '16px 0',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          marginBottom: '20px',
        }}
      >
        {icon || <RiShoppingBagLine />}
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          color: 'var(--color-primary-dark)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--color-text-secondary)',
          maxWidth: '420px',
          marginBottom: actionLabel ? '24px' : '0',
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>

      {actionLabel && (
        <Button
          variant="primary"
          onClick={onAction}
          icon={actionIcon}
          size="md"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
