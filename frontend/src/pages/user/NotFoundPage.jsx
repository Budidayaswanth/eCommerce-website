import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RiSearchLine,
  RiHome5Line,
  RiCompass3Line,
  RiShoppingBag3Line,
  RiFileTextLine,
  RiPaintBrushLine,
  RiBuildingLine,
  RiDropLine,
  RiMagicLine,
} from 'react-icons/ri';
import Footer from '../../components/layout/Footer';

const NotFoundPage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const POPULAR_CATEGORIES = [
    { label: 'Interior Emulsions', path: '/explore/interior-paints', icon: RiPaintBrushLine },
    { label: 'Exterior WeatherShield', path: '/explore/exterior-paints', icon: RiBuildingLine },
    { label: 'Waterproofing Polymers', path: '/explore/waterproofing', icon: RiDropLine },
    { label: 'Primers & Undercoats', path: '/explore/primers', icon: RiMagicLine },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: '32px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '800px',
          margin: '20px auto 0',
          width: '100%',
        }}
      >
        {/* Paint Drops Graphic / 404 Badge */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '5.5rem',
              fontWeight: '900',
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-primary)',
              letterSpacing: '-2px',
              lineHeight: 1,
            }}
          >
            404
          </div>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: '700',
              marginTop: '8px',
            }}
          >
            Palette Shade Not Found
          </div>
        </div>

        <h1
          style={{
            fontSize: '1.625rem',
            color: 'var(--color-primary-dark)',
            margin: '0 0 10px 0',
            fontWeight: '800',
          }}
        >
          Oops! This Paint Formulation Seems Out of Reach
        </h1>

        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--color-text-secondary)',
            maxWidth: '520px',
            lineHeight: 1.6,
            margin: '0 0 28px 0',
          }}
        >
          The page or formulation you are trying to view might have been reformulated, renamed, or temporarily moved. Let's get your painting project back on track!
        </p>

        {/* Quick Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            maxWidth: '440px',
            width: '100%',
            position: 'relative',
            marginBottom: '32px',
          }}
        >
          <input
            type="text"
            placeholder="Search our catalog of luxury paints..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 44px 0 16px',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-page)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            aria-label="Search catalog"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <RiSearchLine size={16} />
          </button>
        </form>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-btn)',
              fontWeight: '600',
              fontSize: '0.875rem',
            }}
          >
            <RiHome5Line size={18} /> Return to Home
          </Link>

          <Link
            to="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary-dark)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-btn)',
              fontWeight: '600',
              fontSize: '0.875rem',
            }}
          >
            <RiCompass3Line size={18} /> Browse Paint Catalog
          </Link>

          <Link
            to="/cart"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-btn)',
              fontWeight: '600',
              fontSize: '0.875rem',
            }}
          >
            <RiShoppingBag3Line size={18} /> View Cart
          </Link>
        </div>

        {/* Recommended Categories */}
        <div style={{ width: '100%', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '14px' }}>
            Popular Coatings & Solutions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            {POPULAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  to={cat.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-bg-page)',
                    color: 'var(--color-primary-dark)',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                  }}
                  className="not-found-cat-chip"
                >
                  <Icon size={18} color="var(--color-primary)" />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .not-found-cat-chip:hover {
          background-color: var(--color-primary-subtle) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
