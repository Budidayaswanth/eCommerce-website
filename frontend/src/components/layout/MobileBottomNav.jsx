import React from 'react';
import { NavLink } from 'react-router-dom';
import { RiHome5Line, RiCompass3Line, RiShoppingBag3Line, RiUser3Line } from 'react-icons/ri';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
  const { totalItems, openDrawer } = useCart();
  const { isAuthenticated, openLoginModal } = useAuth();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--bottom-nav-height)',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--color-border)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 'var(--z-bottom-nav)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      className="mobile-bottom-nav-bar"
    >
      <NavLink
        to="/"
        className={({ isActive }) => `bottom-tab-item ${isActive ? 'active' : ''}`}
      >
        <RiHome5Line size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) => `bottom-tab-item ${isActive ? 'active' : ''}`}
      >
        <RiCompass3Line size={22} />
        <span>Explore</span>
      </NavLink>

      {/* Cart tab opens drawer or navigates */}
      <button
        onClick={openDrawer}
        className="bottom-tab-item"
        style={{ position: 'relative' }}
      >
        <RiShoppingBag3Line size={22} />
        {totalItems > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '20px',
              backgroundColor: 'var(--color-accent)',
              color: '#FFFFFF',
              fontSize: '0.625rem',
              fontWeight: '700',
              minWidth: '16px',
              height: '16px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {totalItems}
          </span>
        )}
        <span>Cart</span>
      </button>

      {isAuthenticated ? (
        <NavLink
          to="/profile"
          className={({ isActive }) => `bottom-tab-item ${isActive ? 'active' : ''}`}
        >
          <RiUser3Line size={22} />
          <span>Profile</span>
        </NavLink>
      ) : (
        <button onClick={openLoginModal} className="bottom-tab-item">
          <RiUser3Line size={22} />
          <span>Login</span>
        </button>
      )}

      <style>{`
        .bottom-tab-item {
          display: flex;
          flex-direction: column;
          alignItems: center;
          justify-content: center;
          gap: 2px;
          color: var(--color-text-secondary);
          font-size: 0.6875rem;
          font-weight: 500;
          text-decoration: none;
          flex: 1;
          height: 100%;
          background: none;
          border: none;
          cursor: pointer;
        }
        .bottom-tab-item.active {
          color: var(--color-primary);
          font-weight: 700;
        }
        .bottom-tab-item.active svg {
          color: var(--color-secondary-dark);
        }
        @media (max-width: 1024px) {
          .mobile-bottom-nav-bar {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default MobileBottomNav;
