import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  RiDashboardLine,
  RiPaintBrushLine,
  RiFileList3Line,
  RiCoupon3Line,
  RiImageLine,
  RiUserSharedLine,
  RiHistoryLine,
  RiQuestionAnswerLine,
  RiStarLine,
  RiLogoutBoxRLine,
  RiStore2Line,
  RiMenuLine,
  RiCloseLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin', exact: true, icon: RiDashboardLine },
  { label: 'Products', path: '/admin/products', icon: RiPaintBrushLine },
  { label: 'Orders', path: '/admin/orders', icon: RiFileList3Line },
  { label: 'Coupons', path: '/admin/coupons', icon: RiCoupon3Line },
  { label: 'Banners', path: '/admin/banners', icon: RiImageLine },
  { label: 'Users', path: '/admin/users', icon: RiUserSharedLine },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: RiHistoryLine },
  { label: 'Live Support', path: '/admin/chat', icon: RiQuestionAnswerLine },
  { label: 'Reviews Moderation', path: '/admin/reviews', icon: RiStarLine },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0D1354',
        color: '#FFFFFF',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo.jpg"
            alt="LEO PAINTS"
            style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
              LEO PAINTS
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--color-secondary)', fontWeight: '600' }}>
              ADMIN CONSOLE
            </div>
          </div>
        </div>

        {setMobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#FFFFFF', display: 'none' }}
            className="admin-mobile-close"
          >
            <RiCloseLine size={24} />
          </button>
        )}
      </div>

      {/* Admin Nav Items */}
      <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.exact}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  color: '#CFD8DC',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Store Link & Logout */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <NavLink
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#B0BEC5',
            fontSize: '0.875rem',
            padding: '8px',
            borderRadius: '6px',
          }}
          className="admin-bottom-link"
        >
          <RiStore2Line size={18} />
          <span>Switch to Storefront</span>
        </NavLink>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#FF8A80',
            fontSize: '0.875rem',
            padding: '8px',
            borderRadius: '6px',
            textAlign: 'left',
          }}
          className="admin-bottom-link"
        >
          <RiLogoutBoxRLine size={18} />
          <span>Admin Logout</span>
        </button>
      </div>

      <style>{`
        .admin-nav-item:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
        }
        .admin-nav-item.active {
          background-color: rgba(255, 215, 0, 0.15);
          color: var(--color-secondary) !important;
          border-left: 4px solid var(--color-secondary);
          font-weight: 600;
        }
        .admin-bottom-link:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
        }
      `}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
      {/* Desktop Admin Sidebar */}
      <aside
        style={{
          width: '250px',
          flexShrink: 0,
          height: '100vh',
          backgroundColor: '#0D1354',
          boxShadow: 'var(--shadow-md)',
          zIndex: 50,
        }}
        className="admin-desktop-sidebar"
      >
        {navContent}
      </aside>

      {/* Mobile Admin Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
          }}
        >
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{ position: 'relative', width: '270px', height: '100%', zIndex: 1 }}>
            {navContent}
          </div>
        </div>
      )}

      {/* Admin Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Admin Header */}
        <header
          style={{
            height: '60px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{ display: 'none', color: 'var(--color-primary-dark)' }}
              className="admin-hamburger"
              aria-label="Toggle menu"
            >
              <RiMenuLine size={22} />
            </button>
            <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              Leo Paints Admin Operations
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                backgroundColor: 'var(--color-primary-subtle)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                color: 'var(--color-primary)',
                fontWeight: '600',
              }}
            >
              <span>{user?.name || 'Administrator'}</span>
              <span style={{ fontSize: '0.6875rem', backgroundColor: 'var(--color-primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                SUPERADMIN
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .admin-desktop-sidebar {
            display: none !important;
          }
          .admin-hamburger {
            display: flex !important;
          }
          .admin-mobile-close {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
