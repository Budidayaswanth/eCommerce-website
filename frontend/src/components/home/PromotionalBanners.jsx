import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiSparklingFill,
  RiDropLine,
  RiPaletteLine,
  RiBuildingLine,
  RiArrowRightLine,
  RiFileCopyLine,
  RiCheckLine,
  RiGiftLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';

const PromotionalBanners = () => {
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  return (
    <div style={{ marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Primary Highlight Feature Banner: Festive Color Carnival */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0A1147 0%, #1A237E 50%, #283593 100%)',
          color: '#FFFFFF',
          padding: '36px 40px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          border: '1.5px solid rgba(255, 215, 0, 0.3)',
        }}
        className="festive-promo-banner"
      >
        {/* Shimmer decorative background circles */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '620px', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              backgroundColor: 'rgba(255, 215, 0, 0.18)',
              color: '#FFD700',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '12px',
              border: '1px solid rgba(255, 215, 0, 0.4)',
            }}
          >
            <RiSparklingFill size={14} color="#FFD700" /> FESTIVE SEASON MEGA OFFER
          </div>

          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '800',
              margin: '0 0 10px 0',
              lineHeight: 1.2,
              color: '#FFFFFF',
              letterSpacing: '-0.3px',
            }}
          >
            Festive Color Carnival: Flat <span style={{ color: '#FFD700' }}>25% Off</span>
          </h2>

          <p
            style={{
              fontSize: '0.9375rem',
              color: '#E0E7FF',
              margin: '0 0 18px 0',
              lineHeight: 1.5,
            }}
          >
            Elevate your home interiors with Teflon-infused Royale emulsions and velvet textures.
            Enjoy complimentary doorstep dispatch on all orders above ₹999.
          </p>

          {/* Coupon Code Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div
              onClick={() => handleCopyCode('FESTIVE25')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px dashed #FFD700',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              title="Click to copy code"
            >
              <RiGiftLine color="#FFD700" size={18} />
              <span style={{ fontSize: '0.875rem', color: '#FFFFFF', fontWeight: '700', letterSpacing: '1px' }}>
                FESTIVE25
              </span>
              {copiedCoupon === 'FESTIVE25' ? (
                <RiCheckLine color="#10B981" size={16} />
              ) : (
                <RiFileCopyLine color="#FFD700" size={16} />
              )}
            </div>

            <Link
              to="/explore?category=interior-paints"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                backgroundColor: '#FFD700',
                color: '#0A1147',
                borderRadius: 'var(--radius-btn)',
                fontWeight: '700',
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.35)',
                transition: 'transform 0.2s',
              }}
            >
              Shop Festive Paints <RiArrowRightLine size={16} />
            </Link>
          </div>
        </div>

        {/* Right side banner graphic visual preview */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '20px 28px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            textAlign: 'center',
          }}
          className="festive-badge-box"
        >
          <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFD700', lineHeight: 1 }}>
            25% OFF
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#FFFFFF' }}>
            Extra ₹500 Off with Code
          </span>
          <span style={{ fontSize: '0.6875rem', color: '#CBD5E1' }}>
            Limited Period Festive Release
          </span>
        </div>
      </div>

      {/* 2. Secondary Triple Promotional Grid Banners */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
        className="promo-grid-three"
      >
        {/* Promo Card 1: Monsoon Waterproofing Shield */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '190px',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.15 }}>
            <RiDropLine size={120} />
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#BAE6FD', marginBottom: '8px' }}>
              <RiDropLine /> 10-Year Warranty
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.25 }}>
              Monsoon Anti-Damp Shield
            </h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#E0F2FE', lineHeight: 1.4 }}>
              Advanced elastomeric polymer coats to seal cracks and terrace water seepages.
            </p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Link
              to="/explore?category=waterproofing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8125rem',
                fontWeight: '700',
                color: '#FFFFFF',
                textDecoration: 'underline',
              }}
            >
              Explore Waterproofing <RiArrowRightLine size={14} />
            </Link>
          </div>
        </div>

        {/* Promo Card 2: Free Computerized Shade Matching & Swatches */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '190px',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.15 }}>
            <RiPaletteLine size={120} />
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#DDD6FE', marginBottom: '8px' }}>
              <RiPaletteLine /> Spectral Precision
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.25 }}>
              Free Color Consultation
            </h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#EDE9FE', lineHeight: 1.4 }}>
              Unsure of wall shades? Connect with our virtual color architects or order swatch cards.
            </p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Link
              to="/explore?paintType=Luxury+Emulsion"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8125rem',
                fontWeight: '700',
                color: '#FFFFFF',
                textDecoration: 'underline',
              }}
            >
              Try Virtual Palette <RiArrowRightLine size={14} />
            </Link>
          </div>
        </div>

        {/* Promo Card 3: Contractor & Architectural Bulk Club */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '190px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.15 }}>
            <RiBuildingLine size={120} />
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#FCD34D', marginBottom: '8px' }}>
              <RiBuildingLine /> Wholesale B2B Program
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.25 }}>
              Architects & Contractors
            </h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#CBD5E1', lineHeight: 1.4 }}>
              Special contractor margins, GST invoicing & direct site dispatch for 20L bulk drums.
            </p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Link
              to="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8125rem',
                fontWeight: '700',
                color: '#FCD34D',
                textDecoration: 'underline',
              }}
            >
              Order Bulk Barrels <RiArrowRightLine size={14} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .promo-grid-three {
            grid-template-columns: 1fr !important;
          }
          .festive-promo-banner {
            padding: 24px 20px !important;
          }
          .festive-badge-box {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PromotionalBanners;
