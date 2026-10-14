import React, { useState, useEffect } from 'react';
import { CATEGORIES, PAINT_TYPES, FINISHES, TRENDING_COLORS } from '../../utils/constants';
import ColorSwatch from './ColorSwatch';
import Button from '../common/Button';
import {
  RiFilter3Line,
  RiCloseLine,
  RiStarFill,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiSearchLine,
} from 'react-icons/ri';

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

  // Accordion collapsible section toggles
  const [openSections, setOpenSections] = useState({
    category: true,
    paintType: true,
    finish: true,
    price: true,
    rating: true,
    color: true,
  });

  const [typeSearch, setTypeSearch] = useState('');
  const [finishSearch, setFinishSearch] = useState('');

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <button
          type="button"
          onClick={() => toggleSection('category')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.875rem',
            color: 'var(--color-primary-dark)',
            marginBottom: openSections.category ? '10px' : 0,
          }}
        >
          <span>Category</span>
          {openSections.category ? <RiArrowUpSLine size={18} /> : <RiArrowDownSLine size={18} />}
        </button>

        {openSections.category && (
          <div
            style={{
              maxHeight: '180px',
              overflowY: 'auto',
              paddingRight: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            className="filter-scroll-container"
          >
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
        )}
      </div>

      {/* Stock Availability */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <div style={{ fontWeight: '700', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--color-primary-dark)' }}>
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

      {/* Paint Technology */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <button
          type="button"
          onClick={() => toggleSection('paintType')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.875rem',
            color: 'var(--color-primary-dark)',
            marginBottom: openSections.paintType ? '10px' : 0,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Paint Technology
            {localTypes.length > 0 && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                }}
              >
                {localTypes.length}
              </span>
            )}
          </span>
          {openSections.paintType ? <RiArrowUpSLine size={18} /> : <RiArrowDownSLine size={18} />}
        </button>

        {openSections.paintType && (
          <div>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <RiSearchLine
                size={14}
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search paint types..."
                value={typeSearch}
                onChange={(e) => setTypeSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: '30px',
                  padding: '0 8px 0 28px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.75rem',
                }}
              />
            </div>
            <div
              style={{
                maxHeight: '190px',
                overflowY: 'auto',
                paddingRight: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
              className="filter-scroll-container"
            >
              {PAINT_TYPES.filter((t) => t.toLowerCase().includes(typeSearch.toLowerCase().trim())).map((type) => (
                <label
                  key={type}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={localTypes.includes(type)}
                    onChange={() => handleToggleType(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
              {PAINT_TYPES.filter((t) => t.toLowerCase().includes(typeSearch.toLowerCase().trim())).length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '6px 0' }}>
                  No matching paint technology
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Surface Sheen & Finish */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <button
          type="button"
          onClick={() => toggleSection('finish')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.875rem',
            color: 'var(--color-primary-dark)',
            marginBottom: openSections.finish ? '10px' : 0,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Surface Sheen & Finish
            {localFinishes.length > 0 && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                }}
              >
                {localFinishes.length}
              </span>
            )}
          </span>
          {openSections.finish ? <RiArrowUpSLine size={18} /> : <RiArrowDownSLine size={18} />}
        </button>

        {openSections.finish && (
          <div>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <RiSearchLine
                size={14}
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search finishes..."
                value={finishSearch}
                onChange={(e) => setFinishSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: '30px',
                  padding: '0 8px 0 28px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.75rem',
                }}
              />
            </div>
            <div
              style={{
                maxHeight: '190px',
                overflowY: 'auto',
                paddingRight: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
              className="filter-scroll-container"
            >
              {FINISHES.filter((f) => f.toLowerCase().includes(finishSearch.toLowerCase().trim())).map((fin) => (
                <label
                  key={fin}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={localFinishes.includes(fin)}
                    onChange={() => handleToggleFinish(fin)}
                  />
                  <span>{fin}</span>
                </label>
              ))}
              {FINISHES.filter((f) => f.toLowerCase().includes(finishSearch.toLowerCase().trim())).length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '6px 0' }}>
                  No matching finish found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <button
          type="button"
          onClick={() => toggleSection('price')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.875rem',
            color: 'var(--color-primary-dark)',
            marginBottom: openSections.price ? '10px' : 0,
          }}
        >
          <span>Price Range (₹)</span>
          {openSections.price ? <RiArrowUpSLine size={18} /> : <RiArrowDownSLine size={18} />}
        </button>

        {openSections.price && (
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
        )}
      </div>

      {/* Trending Color Swatches */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <button
          type="button"
          onClick={() => toggleSection('color')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.875rem',
            color: 'var(--color-primary-dark)',
            marginBottom: openSections.color ? '10px' : 0,
          }}
        >
          <span>Color Family</span>
          {openSections.color ? <RiArrowUpSLine size={18} /> : <RiArrowDownSLine size={18} />}
        </button>

        {openSections.color && (
          <div
            style={{
              maxHeight: '160px',
              overflowY: 'auto',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              paddingRight: '4px',
            }}
            className="filter-scroll-container"
          >
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
        )}
      </div>

      {/* Customer Rating */}
      <div style={{ paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => toggleSection('rating')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.875rem',
            color: 'var(--color-primary-dark)',
            marginBottom: openSections.rating ? '10px' : 0,
          }}
        >
          <span>Minimum Rating</span>
          {openSections.rating ? <RiArrowUpSLine size={18} /> : <RiArrowDownSLine size={18} />}
        </button>

        {openSections.rating && (
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
        )}
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
        .filter-scroll-container {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
        }
        .filter-scroll-container::-webkit-scrollbar {
          width: 5px;
        }
        .filter-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .filter-scroll-container::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 4px;
        }
        .filter-scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }
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
