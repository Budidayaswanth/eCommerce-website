import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  RiHome5Line,
  RiCompass3Line,
  RiPaintBrushLine,
  RiBuildingLine,
  RiMagicLine,
  RiTreeLine,
  RiDropLine,
  RiArtboardLine,
  RiPriceTag3Line,
  RiCustomerService2Line,
  RiCloseLine,
} from 'react-icons/ri';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: RiHome5Line },
  { label: 'Explore All', path: '/explore', icon: RiCompass3Line },
  { label: 'Interior Paints', path: '/explore/interior-paints', icon: RiPaintBrushLine },
  { label: 'Exterior Paints', path: '/explore/exterior-paints', icon: RiBuildingLine },
  { label: 'Primers & Undercoats', path: '/explore/primers', icon: RiMagicLine },
  { label: 'Wood Finishes', path: '/explore/wood-finishes', icon: RiTreeLine },
  { label: 'Waterproofing', path: '/explore/waterproofing', icon: RiDropLine },
  { label: 'Textures & Designer', path: '/explore/textures', icon: RiArtboardLine },
  { label: 'Offers & Deals', path: '/explore?filter=offers', icon: RiPriceTag3Line },
  { label: 'Contact Us', path: '/explore?contact=open', icon: RiCustomerService2Line },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/logo.jpg"
            alt="Leo Paints"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              objectFit: 'cover',
              border: '2px solid var(--color-secondary)',
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#FFFFFF',
                letterSpacing: '1px',
                lineHeight: 1,
              }}
            >
              LEO PAINTS
            </div>
            <div
              style={{
                fontSize: '0.625rem',
                color: 'var(--color-secondary)',
                fontWeight: '600',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginTop: '4px',
              }}
            >
              ROYAL FINISHES
            </div>
          </div>
        </div>

        {/* Close Button on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              color: '#FFFFFF',
              display: 'none',
              padding: '6px',
            }}
            className="sidebar-close-mobile"
          >
            <RiCloseLine size={24} />
          </button>
        )}
      </div>

      {/* Navigation Links (Scrolls only within sidebar if window is short) */}
      <nav
        style={{
          flex: 1,
          padding: '16px 0',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path.split('?')[0]) &&
                  (item.path.includes('?') ? location.search.includes(item.path.split('?')[1]) : true);

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '11px 20px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--color-secondary)' : '#E0E0E0',
                  backgroundColor: isActive ? 'rgba(255, 215, 0, 0.12)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--color-secondary)' : '4px solid transparent',
                  transition: 'all var(--transition-fast)',
                }}
                className="sidebar-nav-link"
              >
                <Icon size={20} style={{ color: isActive ? 'var(--color-secondary)' : '#9FA8DA' }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer Info Box */}
      <div
        style={{
          padding: '18px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          fontSize: '0.75rem',
          color: '#9FA8DA',
        }}
      >
        <div style={{ color: 'var(--color-secondary)', fontWeight: '600', marginBottom: '4px' }}>
          Need Paint Assistance?
        </div>
        <div>Toll Free: 1800-LEO-PAINTS</div>
        <div style={{ marginTop: '2px' }}>support@leopaints.com</div>
      </div>

      <style>{`
        .sidebar-nav-link:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
        }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar: 260px wide, NEVER moves/scrolls with page */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          height: '100%',
          flexShrink: 0,
          backgroundColor: 'var(--color-primary)',
          zIndex: 'var(--z-sidebar)',
          boxShadow: 'var(--shadow-md)',
        }}
        className="desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-drawer)',
            display: 'flex',
          }}
          className="mobile-sidebar-overlay"
        >
          <div
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(2px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '280px',
              maxWidth: '85%',
              height: '100%',
              backgroundColor: 'var(--color-primary)',
              zIndex: 1,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-sidebar {
            display: none !important;
          }
          .sidebar-close-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
