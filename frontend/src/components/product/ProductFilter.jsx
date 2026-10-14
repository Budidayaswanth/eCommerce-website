import React, { useState, useEffect } from 'react';
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
  const [localInStockOnly, setLocalInStockOnly] = useState(filters.inStockOnly || false);

  // Synchronize internal state whenever parent filters prop changes
  useEffect(() => {
    setLocalCategory(filters.category || 'all');
    setLocalTypes(Array.isArray(filters.paintType) ? filters.paintType : (filters.paintType ? [filters.paintType] : []));
    setLocalFinishes(Array.isArray(filters.finish) ? filters.finish : (filters.finish ? [filters.finish] : []));
    setLocalMinPrice(filters.minPrice ?? '');
    setLocalMaxPrice(filters.maxPrice ?? '');
    setLocalRating(filters.minRating ?? '');
    setLocalColor(filters.color || '');
    setLocalInStockOnly(!!filters.inStockOnly);
  }, [filters]);

  const handleCategorySelect = (catSlug) => {
    setLocalCategory(catSlug);
    onFilterChange({ category: catSlug });
  };

  const handleToggleType = (type) => {
    const updated = localTypes.includes(type)
      ? localTypes.filter((t) => t !== type)
      : [...localTypes, type];
    setLocalTypes(updated);
    onFilterChange({ paintType: updated });
  };

  const handleToggleFinish = (finish) => {
    const updated = localFinishes.includes(finish)
      ? localFinishes.filter((f) => f !== finish)
      : [...localFinishes, finish];
    setLocalFinishes(updated);
    onFilterChange({ finish: updated });
  };

  const handleInStockChange = (checked) => {
    setLocalInStockOnly(checked);
    onFilterChange({ inStockOnly: checked });
  };

  const handlePriceBlur = () => {
    onFilterChange({ minPrice: localMinPrice, maxPrice: localMaxPrice });
  };

  const handleRatingSelect = (rating) => {
    const updated = Number(localRating) === rating ? '' : rating;
    setLocalRating(updated);
    onFilterChange({ minRating: updated });
  };

  const handleColorSelect = (colName) => {
    const updated = localColor === colName ? '' : colName;
    setLocalColor(updated);
    onFilterChange({ color: updated });
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
      inStockOnly: localInStockOnly,
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
    setLocalInStockOnly(false);
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
              checked={localCategory === 'all' || !localCategory}
              onChange={() => handleCategorySelect('all')}
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
                checked={localCategory === cat.slug || localCategory === cat.id}
                onChange={() => handleCategorySelect(cat.slug)}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Stock Availability */}
      <div>
        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
          Availability
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={localInStockOnly}
            onChange={(e) => handleInStockChange(e.target.checked)}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
            In Stock Only
          </span>
        </label>
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
            onBlur={handlePriceBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handlePriceBlur(); }}
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
            onBlur={handlePriceBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handlePriceBlur(); }}
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
              onClick={() => handleColorSelect(col.name)}
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
                onChange={() => handleRatingSelect(stars)}
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
      {/* Desktop Filter Sidebar (Sticky while scrolling products) */}
      <div
        style={{
          width: '280px',
          flexShrink: 0,
          position: 'sticky',
          top: '20px',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
        }}
        className="desktop-filter-panel"
      >
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
