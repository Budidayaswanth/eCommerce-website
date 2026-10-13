import React, { useState } from 'react';
import { CATEGORIES, PAINT_TYPES, FINISHES, TRENDING_COLORS } from '../../utils/constants';
import ColorSwatch from './ColorSwatch';
import Button from '../common/Button';
import { RiFilter3Line, RiCloseLine, RiStarFill } from 'react-icons/ri';

const ProductFilter = ({
  filters,
  onFilterChange,
  onClearFilters,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [localCategory, setLocalCategory] = useState(filters.category || 'all');
  const [localTypes, setLocalTypes] = useState(filters.paintType || []);
  const [localFinishes, setLocalFinishes] = useState(filters.finish || []);
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '');
  const [localRating, setLocalRating] = useState(filters.minRating || '');
  const [localColor, setLocalColor] = useState(filters.color || '');

  const handleToggleType = (type) => {
    setLocalTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleToggleFinish = (finish) => {
    setLocalFinishes((prev) =>
      prev.includes(finish) ? prev.filter((f) => f !== finish) : [...prev, finish]
    );
  };

  const handleApply = () => {
    onFilterChange({
      category: localCategory,
      paintType: localTypes,
      finish: localFinishes,
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
      minRating: localRating,
      color: localColor,
    });
    if (onCloseMobile) onCloseMobile();
  };

  const handleClear = () => {
    setLocalCategory('all');
    setLocalTypes([]);
    setLocalFinishes([]);
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalRating('');
    setLocalColor('');
    onClearFilters();
    if (onCloseMobile) onCloseMobile();
  };

  const filterContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        padding: '20px',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: 'var(--color-primary-dark)' }}>
          <RiFilter3Line size={20} />
          <span>Filters</span>
        </div>
        <button
          onClick={handleClear}
          style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', fontWeight: '600', textDecoration: 'underline' }}
        >
          Clear All
        </button>
      </div>

      {/* Category */}
      <div>
        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
          Category
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="filter-cat"
              checked={localCategory === 'all'}
              onChange={() => setLocalCategory('all')}
            />
            All Categories
          </label>
          {CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <input
                type="radio"
                name="filter-cat"
                checked={localCategory === cat.id || localCategory === cat.slug}
                onChange={() => setLocalCategory(cat.id)}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Paint Types */}
      <div>
        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
          Paint Technology
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PAINT_TYPES.map((type) => (
            <label
              key={type}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={localTypes.includes(type)}
                onChange={() => handleToggleType(type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Finishes */}
      <div>
        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
          Surface Sheen & Finish
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FINISHES.map((fin) => (
            <label
              key={fin}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={localFinishes.includes(fin)}
                onChange={() => handleToggleFinish(fin)}
              />
              {fin}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
          Price Range (₹)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            placeholder="Min"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 8px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
            }}
          />
          <span style={{ color: 'var(--color-text-muted)' }}>-</span>
          <input
            type="number"
            placeholder="Max"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 8px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
            }}
          />
        </div>
      </div>

      {/* Trending Color Swatches */}
      <div>
        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
          Color Family
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TRENDING_COLORS.map((col) => (
            <ColorSwatch
              key={col.name}
              colorName={col.name}
              hexCode={col.hex}
              isSelected={localColor === col.name}
              size={30}
              onClick={() => setLocalColor(localColor === col.name ? '' : col.name)}
            />
          ))}
        </div>
      </div>

      {/* Customer Rating */}
      <div>
        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
          Minimum Rating
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[4, 3, 2].map((stars) => (
            <label
              key={stars}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', cursor: 'pointer' }}
            >
              <input
                type="radio"
                name="filter-rating"
                checked={Number(localRating) === stars}
                onChange={() => setLocalRating(stars)}
              />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#B45309' }}>
                {stars} <RiStarFill color="#FFD700" /> & above
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <Button variant="primary" fullWidth onClick={handleApply}>
        Apply Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Sidebar */}
      <div style={{ width: '280px', flexShrink: 0 }} className="desktop-filter-panel">
        {filterContent}
      </div>

      {/* Mobile Bottom Slide-Over */}
      {isOpenMobile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-drawer)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={onCloseMobile}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(2px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '20px',
              zIndex: 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button onClick={onCloseMobile} style={{ padding: '6px' }}>
                <RiCloseLine size={24} />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-filter-panel {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default ProductFilter;
