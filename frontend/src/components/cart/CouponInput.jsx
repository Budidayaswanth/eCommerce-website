import React, { useState } from 'react';
import couponService from '../../services/couponService';
import { useCart } from '../../context/CartContext';
import { RiPriceTag3Line, RiCloseCircleLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const CouponInput = () => {
  const { appliedCoupon, totalAmount, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError('');
    setLoading(true);

    try {
      const validated = await couponService.validateCoupon(code.trim(), totalAmount);
      applyCoupon(validated);
      setCode('');
    } catch (err) {
      setError(err.message || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#E8F5E9',
          borderRadius: 'var(--radius-btn)',
          border: '1px solid #A5D6A7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
          <RiPriceTag3Line color="#2E7D32" size={18} />
          <div>
            <div style={{ fontWeight: '700', color: '#1B5E20' }}>{appliedCoupon.code} Applied</div>
            <div style={{ fontSize: '0.75rem', color: '#388E3C' }}>{appliedCoupon.description}</div>
          </div>
        </div>

        <button
          onClick={removeCoupon}
          style={{ color: 'var(--color-accent)', padding: '4px', display: 'flex', alignItems: 'center' }}
          title="Remove coupon"
        >
          <RiCloseCircleLine size={20} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <form onSubmit={handleApply} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Promo Code (e.g. FESTIVE25)"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError('');
          }}
          style={{
            flex: 1,
            height: '38px',
            padding: '0 12px',
            borderRadius: 'var(--radius-btn)',
            border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
            fontSize: '0.8125rem',
            textTransform: 'uppercase',
          }}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          style={{
            height: '38px',
            padding: '0 16px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-btn)',
            fontWeight: '600',
            fontSize: '0.8125rem',
            opacity: !code.trim() ? 0.6 : 1,
            cursor: !code.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Verifying...' : 'Apply'}
        </button>
      </form>

      {error && <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
};

export default CouponInput;
