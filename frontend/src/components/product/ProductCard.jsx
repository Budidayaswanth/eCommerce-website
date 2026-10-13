import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiHeartLine, RiHeartFill, RiShoppingBag3Line } from 'react-icons/ri';
import StarRating from '../common/StarRating';
import Badge from '../common/Badge';
import { formatPrice, calculateDiscount } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import wishlistService from '../../services/wishlistService';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, openLoginModal } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      const list = await wishlistService.getWishlist();
      setIsWishlisted(list.some((item) => item.id === product.id));
    };
    checkWishlist();
  }, [product.id]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add to your wishlist');
      openLoginModal();
      return;
    }

    if (isWishlisted) {
      await wishlistService.removeFromWishlist(product.id);
      setIsWishlisted(false);
      toast.success('Removed from wishlist');
    } else {
      await wishlistService.addToWishlist(product);
      setIsWishlisted(true);
      toast.success('Saved to wishlist');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product, 1, product.sizes?.[0] || '4 Litres', product.finish || 'Matte');
    setIsAdding(false);
  };

  const discountVal = product.discount || calculateDiscount(product.mrp, product.price);

  return (
    <div
      className="product-card hover-lift"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minWidth: '220px',
        border: '1px solid var(--color-border-light)',
      }}
    >
      {/* Product Image Area */}
      <Link
        to={`/product/${product.slug}`}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          aspectRatio: '1/1',
          overflow: 'hidden',
          backgroundColor: '#F9FAFB',
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          className="product-card-img"
        />

        {/* Discount Badge (Top-Left) */}
        {discountVal > 0 && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
            <Badge variant="discount" discountPercentage={discountVal} size="sm" />
          </div>
        )}

        {/* Wishlist Heart Icon (Top-Right) */}
        <button
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 2,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            color: isWishlisted ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            transition: 'transform var(--transition-fast)',
          }}
          className="wishlist-btn-hover"
        >
          {isWishlisted ? <RiHeartFill size={20} /> : <RiHeartLine size={20} />}
        </button>
      </Link>

      {/* Product Details Section */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <div>
          {/* Paint type & Finish tags */}
          <div
            style={{
              fontSize: '0.6875rem',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600',
              marginBottom: '4px',
            }}
          >
            {product.paintType || 'Emulsion'} • {product.finish || 'Matte'}
          </div>

          {/* Product Name (truncated to 2 lines) */}
          <Link
            to={`/product/${product.slug}`}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              lineHeight: 1.35,
              marginBottom: '6px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6em',
            }}
            className="product-name-link"
          >
            {product.name}
          </Link>

          {/* Star Rating with Count */}
          <div style={{ marginBottom: '8px' }}>
            <StarRating rating={product.rating || 4.5} count={product.reviewCount || 30} size={15} />
          </div>

          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: 'var(--color-primary)',
                lineHeight: 1,
              }}
            >
              {formatPrice(product.price)}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-muted)',
                  textDecoration: 'line-through',
                }}
              >
                {formatPrice(product.mrp)}
              </span>
            )}
            {discountVal > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--color-success)',
                }}
              >
                {discountVal}% off
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          aria-label={`Add ${product.name} to cart`}
          style={{
            width: '100%',
            height: '38px',
            borderRadius: 'var(--radius-btn)',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            fontWeight: '600',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color var(--transition-base), color var(--transition-base)',
            marginTop: '4px',
          }}
          className="add-to-cart-btn"
        >
          <RiShoppingBag3Line size={17} />
          <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
        </button>
      </div>

      <style>{`
        .product-card:hover .product-card-img {
          transform: scale(1.05);
        }
        .product-name-link:hover {
          color: var(--color-primary) !important;
        }
        .wishlist-btn-hover:hover {
          transform: scale(1.15);
        }
        .add-to-cart-btn:hover {
          background-color: var(--color-secondary) !important;
          color: var(--color-primary-dark) !important;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
