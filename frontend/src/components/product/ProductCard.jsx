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

  const isOutOfStock = product.stockQuantity === 0 || product.inStock === false;
  const isLowStock = !isOutOfStock && product.stockQuantity > 0 && product.stockQuantity <= 5;

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
          gap: '8px',
        }}
      >
        <div>
          {/* Paint type, Finish & Stock Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600',
              }}
            >
              {product.paintType || 'Emulsion'} • {product.finish || 'Matte'}
            </span>

            {/* Availability Status Indicator */}
            {isOutOfStock ? (
              <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                Only {product.stockQuantity} left
              </span>
            ) : (
              <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                In Stock
              </span>
            )}
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

          {/* Color shade preview swatches (including dual/mixed shade dot) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
            <span
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                backgroundColor: product.colorHex || '#1A237E',
                border: '1px solid rgba(0,0,0,0.2)',
                display: 'inline-block',
              }}
              title={`Base Shade: ${product.color || 'Royal Navy'}`}
            />
            <span
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                backgroundColor: '#FFD700',
                border: '1px solid rgba(0,0,0,0.2)',
                display: 'inline-block',
              }}
              title="Accent Shade: Imperial Gold"
            />
            <span
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1A237E 50%, #FFD700 50%)',
                border: '1px solid rgba(0,0,0,0.2)',
                display: 'inline-block',
              }}
              title="Mixed Dual-Tone Combination Available"
            />
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginLeft: '3px' }}>
              +10 shades
            </span>
          </div>

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
          disabled={isAdding || isOutOfStock}
          aria-label={`Add ${product.name} to cart`}
          style={{
            width: '100%',
            height: '38px',
            borderRadius: 'var(--radius-btn)',
            backgroundColor: isOutOfStock ? '#E2E8F0' : 'var(--color-primary)',
            color: isOutOfStock ? '#94A3B8' : '#FFFFFF',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color var(--transition-base), color var(--transition-base)',
            marginTop: '4px',
          }}
          className={isOutOfStock ? '' : 'add-to-cart-btn'}
        >
          <RiShoppingBag3Line size={17} />
          <span>{isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Cart'}</span>
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
