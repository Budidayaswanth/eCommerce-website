import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import wishlistService from '../../services/wishlistService';
import ProductCard from '../product/ProductCard';
import EmptyState from '../common/EmptyState';
import Loader from '../common/Loader';
import { RiHeart3Line } from 'react-icons/ri';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const list = await wishlistService.getWishlist();
        setWishlist(list);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <Loader fullPage message="Loading your curated wishlist..." />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
          My Saved Shades & Wishlist
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Keep track of your favorite formulations, finish combinations, and room color schemes.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={<RiHeart3Line />}
          title="Your wishlist is empty"
          subtitle="Explore our designer paints, textures and waterproofing membranes to save shades you adore."
          actionLabel="Explore Paint Catalog"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
          }}
          className="wishlist-grid"
        >
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 1200px) {
          .wishlist-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 800px) {
          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .wishlist-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WishlistPage;
