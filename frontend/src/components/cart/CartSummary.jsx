import React from 'react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

const CartSummary = () => {
  const { totalAmount, couponDiscount, deliveryCharge, finalAmount } = useCart();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '16px',
        backgroundColor: 'var(--color-bg-page)',
        borderRadius: 'var(--radius-card)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>Item Subtotal</span>
        <span style={{ fontWeight: '600' }}>{formatPrice(totalAmount)}</span>
      </div>

      {couponDiscount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-success)' }}>
          <span>Coupon Savings</span>
          <span style={{ fontWeight: '600' }}>-{formatPrice(couponDiscount)}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>
          Doorstep Delivery {totalAmount >= 999 && <span style={{ color: 'var(--color-success)', fontSize: '0.75rem' }}>(Free above ₹999)</span>}
        </span>
        <span style={{ fontWeight: '600', color: deliveryCharge === 0 ? 'var(--color-success)' : 'inherit' }}>
          {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
        </span>
      </div>

      <div
        style={{
          borderTop: '1.5px solid var(--color-border)',
          paddingTop: '12px',
          marginTop: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>
          Order Total
        </span>
        <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-primary)' }}>
          {formatPrice(finalAmount)}
        </span>
      </div>
    </div>
  );
};

export default CartSummary;
