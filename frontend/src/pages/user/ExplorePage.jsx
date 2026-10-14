import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ProductFilter from '../../components/product/ProductFilter';
import ProductGrid from '../../components/product/ProductGrid';
import productService from '../../services/productService';
import Button from '../../components/common/Button';
import Footer from '../../components/layout/Footer';
import { RiFilter3Line, RiSearchLine, RiCloseCircleFill, RiCloseLine } from 'react-icons/ri';
import useDebounce from '../../hooks/useDebounce';
import { CATEGORIES } from '../../utils/constants';

const ExplorePage = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'featured';

  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Fetch recommended formulations for fallback/empty search states
  useEffect(() => {
    productService
      .getFeaturedProducts()
      .then((data) => {
        if (Array.isArray(data)) {
          setRecommendedProducts(data.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  const [filters, setFilters] = useState({
    category: category || searchParams.get('category') || 'all',
    paintType: searchParams.get('paintType') ? searchParams.get('paintType').split(',') : [],
    finish: searchParams.get('finish') ? searchParams.get('finish').split(',') : [],
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    color: searchParams.get('color') || '',
    inStockOnly: searchParams.get('inStockOnly') === 'true',
    search: searchQuery,
    sort: sortParam,
  });

  // Debounce search input (350ms)
  const debouncedSearchInput = useDebounce(searchInput, 350);

  // Debounce complete filter object (400ms) to prevent network spam
  const debouncedFilters = useDebounce(filters, 400);

  // Sync debounced search input to filter state
  useEffect(() => {
    setFilters((prev) => {
      if (prev.search === debouncedSearchInput) return prev;
      return { ...prev, search: debouncedSearchInput };
    });
  }, [debouncedSearchInput]);

  // Keep filters in sync when url params change (e.g. back/forward navigation or navbar search)
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    const currentSort = searchParams.get('sort') || 'featured';
    setSearchInput(currentSearch);
    setFilters((prev) => ({
      ...prev,
      category: category || searchParams.get('category') || 'all',
      search: currentSearch,
      sort: currentSort,
    }));
  }, [category, searchParams]);

  // Fetch filtered products using debounced filters
  useEffect(() => {
    let isCurrent = true;
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        let data = await productService.getProducts({
          category: debouncedFilters.category,
          paintType: debouncedFilters.paintType,
          finish: debouncedFilters.finish,
          minPrice: debouncedFilters.minPrice,
          maxPrice: debouncedFilters.maxPrice,
          minRating: debouncedFilters.minRating,
          inStockOnly: debouncedFilters.inStockOnly,
          color: debouncedFilters.color,
          search: debouncedFilters.search,
          sort: debouncedFilters.sort,
        });

        // Client-side guard for inStock and color
        if (debouncedFilters.inStockOnly) {
          data = data.filter((p) => p.inStock && p.stockQuantity > 0);
        }

        if (debouncedFilters.color) {
          data = data.filter((p) =>
            (p.color && p.color.toLowerCase().includes(debouncedFilters.color.toLowerCase())) ||
            (p.colorHex && p.colorHex.toLowerCase() === debouncedFilters.color.toLowerCase())
          );
        }

        if (isCurrent) {
          setProducts(data);
        }
      } catch (err) {
        if (isCurrent) setProducts([]);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchFiltered();

    return () => {
      isCurrent = false;
    };
  }, [debouncedFilters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setFilters({
      category: 'all',
      paintType: [],
      finish: [],
      minPrice: '',
      maxPrice: '',
      minRating: '',
      color: '',
      inStockOnly: false,
      search: '',
      sort: 'featured',
    });
    setSearchParams({});
    if (category) {
      navigate('/explore');
    }
  };

  const handleRemoveFilter = (key, value = null) => {
    if (key === 'search') {
      setSearchInput('');
      setFilters((prev) => ({ ...prev, search: '' }));
      const newParams = Object.fromEntries(searchParams.entries());
      delete newParams.search;
      setSearchParams(newParams);
    } else if (key === 'category') {
      setFilters((prev) => ({ ...prev, category: 'all' }));
      if (category) navigate('/explore');
    } else if (key === 'paintType' && value) {
      setFilters((prev) => ({ ...prev, paintType: prev.paintType.filter((t) => t !== value) }));
    } else if (key === 'finish' && value) {
      setFilters((prev) => ({ ...prev, finish: prev.finish.filter((f) => f !== value) }));
    } else if (key === 'price') {
      setFilters((prev) => ({ ...prev, minPrice: '', maxPrice: '' }));
    } else if (key === 'rating') {
      setFilters((prev) => ({ ...prev, minRating: '' }));
    } else if (key === 'color') {
      setFilters((prev) => ({ ...prev, color: '' }));
    } else if (key === 'inStockOnly') {
      setFilters((prev) => ({ ...prev, inStockOnly: false }));
    }
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, sort: val }));
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, sort: val });
  };

  const getPageTitle = () => {
    if (filters.search) return `Results for "${filters.search}"`;
    if (filters.category && filters.category !== 'all') {
      const match = CATEGORIES.find((c) => c.slug === filters.category || c.id === filters.category);
      if (match) return match.name;
      const clean = filters.category.replace(/-/g, ' ');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return 'Architectural & Decorative Paints Catalog';
  };

  // Determine active filter chips
  const activeChips = [];
  if (filters.search) {
    activeChips.push({ key: 'search', label: `Search: "${filters.search}"` });
  }
  if (filters.category && filters.category !== 'all') {
    const match = CATEGORIES.find((c) => c.slug === filters.category || c.id === filters.category);
    activeChips.push({ key: 'category', label: `Category: ${match?.name || filters.category}` });
  }
  filters.paintType.forEach((t) => {
    activeChips.push({ key: 'paintType', value: t, label: `Type: ${t}` });
  });
  filters.finish.forEach((f) => {
    activeChips.push({ key: 'finish', value: f, label: `Finish: ${f}` });
  });
  if (filters.minPrice || filters.maxPrice) {
    activeChips.push({
      key: 'price',
      label: `₹${filters.minPrice || '0'} - ₹${filters.maxPrice || '∞'}`,
    });
  }
  if (filters.minRating) {
    activeChips.push({ key: 'rating', label: `${filters.minRating}★ & above` });
  }
  if (filters.color) {
    activeChips.push({ key: 'color', label: `Color: ${filters.color}` });
  }
  if (filters.inStockOnly) {
    activeChips.push({ key: 'inStockOnly', label: 'In Stock Only' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Search & Header Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.625rem',
                color: 'var(--color-primary-dark)',
                margin: 0,
                fontWeight: '800',
                letterSpacing: '-0.3px',
              }}
            >
              {getPageTitle()}
            </h1>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'inline-block' }}>
              Showing {products.length} {products.length === 1 ? 'product' : 'premium formulations'} crafted for lasting brilliance
            </span>
          </div>

          {/* In-Page Real-time Search Input */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '0 1 380px' }}>
            <RiSearchLine
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by name, shade, surface..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 36px 0 38px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-page)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.backgroundColor = '#FFFFFF';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.backgroundColor = 'var(--color-bg-page)';
              }}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  handleRemoveFilter('search');
                }}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RiCloseCircleFill size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Controls Bar: Mobile Filter Trigger + Sort Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {/* Mobile Filter Button */}
          <div className="mobile-filter-trigger" style={{ display: 'none' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              icon={<RiFilter3Line />}
            >
              Filters ({activeChips.length})
            </Button>
          </div>

          {/* Active Filter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', flex: 1 }}>
            {activeChips.map((chip, idx) => (
              <span
                key={`${chip.key}-${chip.value || idx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary-dark)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: '1px solid rgba(26, 35, 126, 0.15)',
                }}
              >
                {chip.label}
                <button
                  onClick={() => handleRemoveFilter(chip.key, chip.value)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <RiCloseLine size={14} />
                </button>
              </span>
            ))}

            {activeChips.length > 0 && (
              <button
                onClick={handleClearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-accent)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '4px 6px',
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Sort:
            </span>
            <select
              value={filters.sort}
              onChange={handleSortChange}
              style={{
                height: '36px',
                padding: '0 12px',
                borderRadius: 'var(--radius-btn)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              <option value="featured">Featured & Best Matches</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Filter + Grid Layout */}
      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        {/* Filter Sidebar */}
        <ProductFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          isOpenMobile={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        {/* Product Cards Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ProductGrid
            products={products}
            isLoading={loading}
            onClearFilters={handleClearFilters}
            recommendedProducts={recommendedProducts}
            searchQuery={filters.search}
          />
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 1024px) {
          .mobile-filter-trigger {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;
