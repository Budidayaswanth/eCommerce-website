import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiShoppingBag3Line, RiArrowRightLine } from 'react-icons/ri';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import CouponInput from './CouponInput';
import CartSummary from './CartSummary';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';

const CartDrawer = () => {
  const { isDrawerOpen, closeDrawer, items, totalItems, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  const handleProceedCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const handleExplore = () => {
    closeDrawer();
    navigate('/explore');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-drawer)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(13, 19, 84, 0.5)',
              backdropFilter: 'blur(3px)',
            }}
          />

          {/* Slide-in Right Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RiShoppingBag3Line size={22} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
                  Your Cart {totalItems > 0 && `(${totalItems} ${totalItems === 1 ? 'item' : 'items'})`}
                </h3>
              </div>

              <button
                onClick={closeDrawer}
                style={{
                  padding: '6px',
                  borderRadius: '50%',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                }}
                aria-label="Close cart drawer"
              >
                <RiCloseLine size={24} />
              </button>
            </div>

            {/* Scrollable Items or Empty State */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 20px',
              }}
            >
              {items.length === 0 ? (
                <EmptyState
                  icon={<RiShoppingBag3Line />}
                  title="Your cart is empty"
                  subtitle="Explore our designer emulsions, exterior paints, and textures to begin decorating."
                  actionLabel="Discover Paints"
                  onAction={handleExplore}
                />
              ) : (
                <div style={{ padding: '10px 0' }}>
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions if cart has items */}
            {items.length > 0 && (
              <div
                style={{
                  borderTop: '1px solid var(--color-border)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {/* Coupon component */}
                <CouponInput />

                {/* Summary calculation */}
                <CartSummary />

                {/* Checkout CTA */}
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleProceedCheckout}
                  endIcon={<RiArrowRightLine />}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
