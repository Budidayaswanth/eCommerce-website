import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TRENDING_COLORS } from '../../utils/constants';

const TrendingColors = () => {
  const navigate = useNavigate();

  const handleColorClick = (colorName) => {
    navigate(`/explore?search=${encodeURIComponent(colorName)}`);
  };

  return (
    <section
      style={{
        marginBottom: '48px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 28px' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'var(--color-secondary-dark)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Curated Palette 2026
        </span>
        <h2 style={{ color: 'var(--color-primary-dark)', fontSize: '1.625rem', marginTop: '4px' }}>
          Trending Hues & Mood Swatches
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Selected by top interior designers and architects for bespoke, mood-enhancing ambiance.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '20px',
          justifyItems: 'center',
        }}
      >
        {TRENDING_COLORS.map((col) => (
          <div
            key={col.name}
            onClick={() => handleColorClick(col.name)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform var(--transition-fast)',
            }}
            className="trending-swatch-item"
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: col.hex,
                boxShadow: 'var(--shadow-md)',
                marginBottom: '10px',
                border: '3px solid #FFFFFF',
                outline: '1px solid rgba(0,0,0,0.1)',
                transition: 'transform var(--transition-fast)',
              }}
              className="trending-swatch-circle"
            />
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                lineHeight: 1.25,
              }}
            >
              {col.name}
            </div>
            <div
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-text-muted)',
                marginTop: '2px',
              }}
            >
              {col.category}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .trending-swatch-item:hover .trending-swatch-circle {
          transform: scale(1.15) rotate(5deg);
        }
        .trending-swatch-item:hover {
          color: var(--color-primary) !important;
        }
      `}</style>
    </section>
  );
};

export default TrendingColors;
