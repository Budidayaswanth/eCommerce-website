import React from 'react';
import ProductCard from './ProductCard';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { RiPaintBrushLine } from 'react-icons/ri';

const ProductGrid = ({
  products = [],
  isLoading = false,
  onClearFilters,
  recommendedProducts = [],
  searchQuery = '',
}) => {
  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          width: '100%',
        }}
        className="product-responsive-grid"
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton key={idx} variant="product-card" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ width: '100%' }}>
        <EmptyState
          icon={<RiPaintBrushLine />}
          title={searchQuery ? `No exact matches for "${searchQuery}"` : 'No paints matching your criteria'}
          subtitle={
            searchQuery
              ? "We couldn't find an exact match for your search terms. Explore our recommended formulations below or try broader keywords."
              : 'Try adjusting your filter settings, price range, or search keyword to discover more shades.'
          }
          actionLabel={onClearFilters ? 'Reset Filters' : undefined}
          onAction={onClearFilters}
        />

        {recommendedProducts.length > 0 && (
          <div style={{ marginTop: '36px', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1.5px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                ✨
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.1875rem',
                    fontWeight: '700',
                    color: 'var(--color-primary-dark)',
                  }}
                >
                  Recommended & Relative Formulations
                </h3>
                <p
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Explore our highest-rated architectural coatings and luxury emulsions tailored for your project
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
                width: '100%',
              }}
              className="product-responsive-grid"
            >
              {recommendedProducts.map((product) => (
                <ProductCard key={`rec-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        width: '100%',
      }}
      className="product-responsive-grid"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      <style>{`
        @media (max-width: 1280px) {
          .product-responsive-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 900px) {
          .product-responsive-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px !important;
          }
        }
        @media (max-width: 480px) {
          .product-responsive-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductGrid;
