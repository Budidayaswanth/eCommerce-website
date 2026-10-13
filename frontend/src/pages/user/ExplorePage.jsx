import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductFilter from '../../components/product/ProductFilter';
import ProductGrid from '../../components/product/ProductGrid';
import productService from '../../services/productService';
import Button from '../../components/common/Button';
import Footer from '../../components/layout/Footer';
import { RiFilter3Line } from 'react-icons/ri';

const ExplorePage = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'featured';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: category || 'all',
    paintType: [],
    finish: [],
    minPrice: '',
    maxPrice: '',
    minRating: '',
    color: '',
    search: searchQuery,
    sort: sortParam,
  });

  // Keep filters in sync when url params change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: category || 'all',
      search: searchQuery,
    }));
  }, [category, searchQuery]);

  // Fetch filtered products
  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({
          category: filters.category,
          paintType: filters.paintType,
          finish: filters.finish,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating,
          color: filters.color,
          search: filters.search,
          sort: filters.sort,
        });
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'all',
      paintType: [],
      finish: [],
      minPrice: '',
      maxPrice: '',
      minRating: '',
      color: '',
      search: '',
      sort: 'featured',
    });
    setSearchParams({});
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, sort: val }));
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, sort: val });
  };

  const getPageTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (category) {
      const clean = category.replace('-', ' ');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return 'Explore All Architectural & Protective Paints';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Title & Sorting Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.625rem', color: 'var(--color-primary-dark)', margin: 0, textTransform: 'capitalize' }}>
            {getPageTitle()}
          </h1>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Showing {products.length} formulations curated for lasting beauty
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile Filter Trigger Button */}
          <div className="mobile-filter-trigger" style={{ display: 'none' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              icon={<RiFilter3Line />}
            >
              Filters
            </Button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={filters.sort}
            onChange={handleSortChange}
            style={{
              height: '38px',
              padding: '0 12px',
              borderRadius: 'var(--radius-btn)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: '500',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="featured">Featured & Best Matches</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Customer Rating</option>
          </select>
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
