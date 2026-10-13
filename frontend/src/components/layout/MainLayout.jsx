import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopBanner from './TopBanner';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import CartDrawer from '../cart/CartDrawer';
import LoginModal from '../auth/LoginModal';
import ChatWidget from '../chat/ChatWidget';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  const location = useLocation();
  const pageContentRef = useRef(null);

  // Auto-scroll .page-content to top on route change
  useEffect(() => {
    if (pageContentRef.current) {
      pageContentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname, location.search]);

  return (
    <div
      className="app-layout"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-page)',
      }}
    >
      {/* Top auto-rotating announcement banner */}
      <TopBanner />

      {/* Main app body */}
      <div
        className="app-body"
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Desktop fixed sidebar (never moves) & Mobile Drawer */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Column */}
        <div
          className="main-content"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {/* Sticky Navbar */}
          <Navbar onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

          {/* ONLY SCROLLABLE AREA */}
          <main
            ref={pageContentRef}
            className="page-content"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              position: 'relative',
            }}
          >
            <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Slide-in Cart Drawer */}
      <CartDrawer />

      {/* Floating Chat Widget */}
      <ChatWidget />

      {/* Global Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />

      <style>{`
        @media (max-width: 1024px) {
          .page-content {
            padding: 16px 12px calc(var(--bottom-nav-height) + 16px) 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
