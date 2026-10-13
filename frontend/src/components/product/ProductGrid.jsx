import React from 'react';
import ProductCard from './ProductCard';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { RiPaintBrushLine } from 'react-icons/ri';

const ProductGrid = ({ products = [], isLoading = false, onClearFilters }) => {
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
      <EmptyState
        icon={<RiPaintBrushLine />}
        title="No paints matching your criteria"
        subtitle="Try adjusting your filter settings, price range, or search keyword to discover more shades."
        actionLabel={onClearFilters ? 'Reset Filters' : undefined}
        onAction={onClearFilters}
      />
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
