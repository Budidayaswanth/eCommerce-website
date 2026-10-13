import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';

const CATEGORY_IMAGES = {
  interior: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80',
  exterior: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&auto=format&fit=crop&q=80',
  primers: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80',
  wood: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
  waterproofing: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80',
  textures: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
};

const CATEGORY_COUNTS = {
  interior: '28+ Formulations',
  exterior: '16+ Weather Shields',
  primers: '12+ Masonry Bases',
  wood: '8+ PU Coatings',
  waterproofing: '10+ Damp Proofers',
  textures: '14+ Stucco Finishes',
};

const CategoryGrid = () => {
  return (
    <section style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: 'var(--color-secondary-dark)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Engineered By Surface
          </span>
          <h2 style={{ color: 'var(--color-primary-dark)', margin: 0, fontSize: '1.625rem' }}>
            Explore By Application
          </h2>
        </div>
        <Link
          to="/explore"
          style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--color-primary)',
            textDecoration: 'none',
          }}
          className="hover-underline"
        >
          View All Categories →
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
        className="category-cards-grid"
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={`/explore/${cat.slug}`}
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
              height: '180px',
              backgroundColor: 'var(--color-primary-dark)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '20px',
              color: '#FFFFFF',
              textDecoration: 'none',
              transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
            }}
            className="category-card-item"
          >
            {/* Background Image */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${CATEGORY_IMAGES[cat.id]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.4s ease',
              }}
              className="cat-bg-img"
            />

            {/* Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(13, 19, 84, 0.9) 0%, rgba(13, 19, 84, 0.4) 60%, transparent 100%)',
              }}
            />

            {/* Content info */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
              <h3
                style={{
                  color: '#FFFFFF',
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  marginBottom: '2px',
                }}
              >
                {cat.name}
              </h3>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-secondary)',
                  fontWeight: '600',
                }}
              >
                {CATEGORY_COUNTS[cat.id] || 'Explore Range'}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .category-card-item:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card-hover);
        }
        .category-card-item:hover .cat-bg-img {
          transform: scale(1.08);
        }
        @media (max-width: 900px) {
          .category-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px !important;
          }
        }
        @media (max-width: 480px) {
          .category-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CategoryGrid;
