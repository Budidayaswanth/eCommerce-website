import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import ProductCard from '../product/ProductCard';
import Skeleton from '../common/Skeleton';
import productService from '../../services/productService';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data.filter((p) => p.featured || p.rating >= 4.7));
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section style={{ marginBottom: '48px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
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
            Handpicked Excellence
          </span>
          <h2 style={{ color: 'var(--color-primary-dark)', margin: 0, fontSize: '1.625rem' }}>
            Featured Masterpieces
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
        >
          View All Products →
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: '20px', overflowX: 'hidden' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ width: '280px', flexShrink: 0 }}>
              <Skeleton variant="product-card" />
            </div>
          ))}
        </div>
      ) : (
        <Swiper
          modules={[Navigation, FreeMode]}
          spaceBetween={20}
          slidesPerView={1.2}
          navigation
          freeMode
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1200: { slidesPerView: 4, spaceBetween: 20 },
          }}
          style={{ paddingBottom: '10px' }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
};

export default FeaturedProducts;
