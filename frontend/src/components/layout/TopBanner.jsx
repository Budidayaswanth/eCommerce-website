import React, { useState, useEffect } from 'react';
import { RiCloseLine, RiFlashlightLine, RiTruckLine, RiGiftLine } from 'react-icons/ri';

const PROMO_MESSAGES = [
  { icon: RiFlashlightLine, text: 'FESTIVE BLOWOUT: Flat 25% OFF with coupon FESTIVE25 on orders above ₹2,000!' },
  { icon: RiTruckLine, text: 'FREE Doorstep Express Delivery on all orders above ₹999 across India.' },
  { icon: RiGiftLine, text: 'Free expert color consultation and digital room visualizer on orders over ₹3,000.' },
];

const TopBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_MESSAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const current = PROMO_MESSAGES[currentIndex];
  const Icon = current.icon;

  return (
    <aside
      aria-label="Promotional announcements"
      style={{
        height: 'var(--top-banner-height)',
        backgroundColor: 'var(--color-primary-dark)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        position: 'relative',
        fontSize: '0.8125rem',
        fontWeight: '500',
        zIndex: 110,
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeText 0.4s ease-in-out',
        }}
        key={currentIndex}
      >
        <Icon size={16} style={{ color: 'var(--color-secondary)' }} />
        <span>{current.text}</span>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss banner"
        style={{
          position: 'absolute',
          right: '12px',
          color: 'rgba(255, 255, 255, 0.7)',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="banner-close-btn"
      >
        <RiCloseLine size={18} />
      </button>

      <style>{`
        @keyframes fadeText {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .banner-close-btn:hover {
          color: #FFFFFF;
        }
        @media (max-width: 640px) {
          aside[aria-label="Promotional announcements"] span {
            font-size: 0.75rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 80vw;
          }
        }
      `}</style>
    </aside>
  );
};

export default TopBanner;
