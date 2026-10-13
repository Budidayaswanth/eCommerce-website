import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/cart/CartItem';
import CouponInput from '../../components/cart/CouponInput';
import CartSummary from '../../components/cart/CartSummary';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Footer from '../../components/layout/Footer';
import { RiShoppingBag3Line, RiArrowRightLine, RiArrowLeftLine } from 'react-icons/ri';

const CartPage = () => {
  const { items, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div>
        <EmptyState
          icon={<RiShoppingBag3Line />}
          title="Your Shopping Cart is Empty"
          subtitle="Explore our curated interior colors, high durability primers, and waterproofing solutions."
          actionLabel="Start Shopping"
          onAction={() => navigate('/explore')}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', margin: 0 }}>
            Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Review your paint volume selection before proceeding to checkout.
          </span>
        </div>

        <button
          onClick={clearCart}
          style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', fontWeight: '600', textDecoration: 'underline' }}
        >
          Clear All Items
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '32px',
          alignItems: 'flex-start',
        }}
        className="cart-full-layout"
      >
        {/* Left: Cart Items List */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}

          <div style={{ marginTop: '20px' }}>
            <Link
              to="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--color-primary)',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
            >
              <RiArrowLeftLine size={18} /> Continue Shopping For More Paints
            </Link>
          </div>
        </div>

        {/* Right: Coupon & Summary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.9375rem', color: 'var(--color-primary-dark)' }}>
              Have a Promo Code?
            </div>
            <CouponInput />
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <CartSummary />

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => navigate('/checkout')}
              endIcon={<RiArrowRightLine />}
            >
              Proceed to Secure Checkout
            </Button>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .cart-full-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CartPage;
