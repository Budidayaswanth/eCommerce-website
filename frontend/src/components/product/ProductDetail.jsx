import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import reviewService from '../../services/reviewService';
import wishlistService from '../../services/wishlistService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, calculateDiscount, formatDate } from '../../utils/formatters';
import StarRating from '../common/StarRating';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ColorSwatch from './ColorSwatch';
import PaintCalculator from './PaintCalculator';
import ProductCard from './ProductCard';
import {
  RiHeartLine,
  RiHeartFill,
  RiShoppingBag3Line,
  RiTruckLine,
  RiShieldCheckLine,
  RiCalculatorLine,
  RiCheckDoubleLine,
  RiStarFill,
} from 'react-icons/ri';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, openLoginModal } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('4 Litres');
  const [selectedFinish, setSelectedFinish] = useState('Matte');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // description | specs | reviews
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);

  // New review form
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const prod = await productService.getProductBySlug(slug);
        setProduct(prod);
        setSelectedImage(prod.images?.[0] || prod.image);
        setSelectedFinish(prod.finish || 'Matte');
        if (prod.sizes?.length) setSelectedSize(prod.sizes[0]);

        // Fetch reviews
        const revs = await reviewService.getProductReviews(prod.id);
        setReviews(revs);

        // Fetch related products
        const all = await productService.getProducts({ category: prod.category });
        setRelatedProducts(all.filter((p) => p.id !== prod.id).slice(0, 4));

        // Wishlist check
        const wish = await wishlistService.getWishlist();
        setIsWishlisted(wish.some((item) => item.id === prod.id));
      } catch (err) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  if (loading) return <Loader fullPage message="Loading paint details..." />;
  if (!product) return <div>Product not found</div>;

  const discountVal = product.discount || calculateDiscount(product.mrp, product.price);
  const savings = product.mrp ? Math.max(0, product.mrp - product.price) : 0;

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to update your wishlist');
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
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedFinish);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      openLoginModal();
      return;
    }
    if (!newReviewComment.trim()) {
      toast.error('Please enter your review feedback');
      return;
    }

    setSubmittingReview(true);
    try {
      const added = await reviewService.addReview({
        productId: product.id,
        rating: newReviewRating,
        title: newReviewTitle,
        comment: newReviewComment,
      });
      setReviews([added, ...reviews]);
      setNewReviewTitle('');
      setNewReviewComment('');
      toast.success('Thank you! Review submitted for verification.');
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '8px' }}>
        <Link to="/" style={{ color: 'var(--color-primary)' }}>Home</Link> /
        <Link to={`/explore/${product.category}`} style={{ color: 'var(--color-primary)' }}>{product.categoryName}</Link> /
        <span style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>{product.name}</span>
      </nav>

      {/* Main Top Detail Row: Left Gallery, Right Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
        }}
        className="product-detail-layout"
      >
        {/* Left: Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
              backgroundColor: '#F9FAFB',
              border: '1px solid var(--color-border)',
            }}
          >
            <img
              src={selectedImage}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {discountVal > 0 && (
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <Badge variant="discount" discountPercentage={discountVal} size="md" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: selectedImage === img ? '2.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header & Category */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="info">{product.paintType}</Badge>
              <Badge variant="gold">{product.finish}</Badge>
            </div>
            <h1 style={{ fontSize: '1.625rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <StarRating rating={product.rating} count={product.reviewCount} size={18} />
              <span style={{ color: 'var(--color-success)', fontSize: '0.8125rem', fontWeight: '600' }}>
                Verified Quality Assured
              </span>
            </div>
          </div>

          {/* Price & Savings */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-bg-page)',
              borderRadius: 'var(--radius-btn)',
              display: 'flex',
              alignItems: 'baseline',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary)' }}>
              {formatPrice(product.price)}
            </span>
            {product.mrp && (
              <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                {formatPrice(product.mrp)}
              </span>
            )}
            {savings > 0 && (
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-success)' }}>
                You Save {formatPrice(savings)} ({discountVal}% OFF)
              </span>
            )}
            <div style={{ width: '100%', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Inclusive of all taxes. Free doorstep shipping on orders above ₹999.
            </div>
          </div>

          {/* Color preview */}
          {product.color && (
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                Shade: <span style={{ color: 'var(--color-primary)' }}>{product.color}</span>
              </div>
              <ColorSwatch
                colorName={product.color}
                hexCode={product.colorHex || '#ECEFF1'}
                isSelected={true}
                size={38}
                showLabel={true}
              />
            </div>
          )}

          {/* Size Selector */}
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
              Select Packaging Volume
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {(product.sizes || ['1 Litre', '4 Litres', '10 Litres', '20 Litres']).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-btn)',
                    border: selectedSize === sz ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: selectedSize === sz ? 'var(--color-primary-subtle)' : '#FFFFFF',
                    color: selectedSize === sz ? 'var(--color-primary-dark)' : 'var(--color-text-primary)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Coverage Info & Calculator Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              border: '1px dashed var(--color-primary)',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: '#FAFAFF',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-primary-dark)' }}>
                Coverage: {product.coverage}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Not sure how many liters to buy?
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCalculator(true)}
              icon={<RiCalculatorLine />}
            >
              Paint Calculator
            </Button>
          </div>

          {/* Quantity and Actions */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Quantity Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-btn)',
                height: '46px',
              }}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '0 14px', fontSize: '1.2rem', fontWeight: '600' }}
              >
                -
              </button>
              <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: '700' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '0 14px', fontSize: '1.2rem', fontWeight: '600' }}
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <div style={{ flex: 1 }}>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleAddToCart}
                icon={<RiShoppingBag3Line size={20} />}
              >
                Add to Cart • {formatPrice(product.price * quantity)}
              </Button>
            </div>

            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-btn)',
                border: '1.5px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isWishlisted ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
              title="Add to Wishlist"
            >
              {isWishlisted ? <RiHeartFill size={22} /> : <RiHeartLine size={22} />}
            </button>
          </div>

          {/* Delivery & Assurance Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
              <RiTruckLine color="var(--color-primary)" size={20} />
              <span>Express Dispatch (2-3 Days)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
              <RiShieldCheckLine color="var(--color-primary)" size={20} />
              <span>100% Genuine Pigment Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Reviews */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '24px 32px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '24px',
            borderBottom: '2px solid var(--color-border)',
            marginBottom: '24px',
          }}
        >
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 0',
                fontSize: '1rem',
                fontWeight: activeTab === tab ? '700' : '500',
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: activeTab === tab ? '3px solid var(--color-primary)' : '3px solid transparent',
                marginBottom: '-2px',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'reviews' ? `Customer Reviews (${reviews.length})` : tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              {product.description}
            </p>
            <h4 style={{ color: 'var(--color-primary-dark)', marginBottom: '12px' }}>Key Performance Highlights:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {(product.features || []).map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                  <RiCheckDoubleLine color="var(--color-success)" size={18} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Category', val: product.categoryName },
              { label: 'Technology', val: product.paintType },
              { label: 'Surface Sheen', val: product.finish },
              { label: 'Coverage Area', val: product.coverage },
              { label: 'Recommended Coats', val: '2 to 3 coats' },
              { label: 'Drying Time', val: 'Surface dry: 30 mins | Recoat: 4-6 hours' },
              { label: 'VOC Content', val: '< 15 g/L (Ultra-Low VOC, Eco-Friendly)' },
              { label: 'Available Can Sizes', val: product.sizes?.join(', ') || '1L, 4L, 10L, 20L' },
            ].map((spec, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  padding: '10px 14px',
                  backgroundColor: i % 2 === 0 ? 'var(--color-bg-page)' : '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ width: '220px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  {spec.label}
                </div>
                <div style={{ flex: 1, color: 'var(--color-text-primary)' }}>{spec.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Review Form */}
            <form
              onSubmit={handleSubmitReview}
              style={{
                backgroundColor: 'var(--color-bg-page)',
                padding: '20px',
                borderRadius: 'var(--radius-btn)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h4 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>Write a Customer Review</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Your Rating:</span>
                <StarRating rating={newReviewRating} interactive onChange={setNewReviewRating} size={22} />
              </div>
              <input
                type="text"
                placeholder="Review Headline (e.g., Flawless coverage & brilliant color)"
                value={newReviewTitle}
                onChange={(e) => setNewReviewTitle(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-btn)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <textarea
                placeholder="Share your experience with the durability, application, and finish..."
                rows={3}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-btn)',
                  border: '1px solid var(--color-border)',
                  resize: 'vertical',
                }}
              />
              <div style={{ alignSelf: 'flex-start' }}>
                <Button type="submit" variant="primary" size="md" isLoading={submittingReview}>
                  Submit Review
                </Button>
              </div>
            </form>

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{rev.userName}</span>
                      {rev.verifiedPurchase && (
                        <span style={{ fontSize: '0.6875rem', backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '2px 6px', borderRadius: '4px' }}>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                  <StarRating rating={rev.rating} size={15} />
                  {rev.title && <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{rev.title}</div>}
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>
            Related Formulations You May Like
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
            className="related-products-grid"
          >
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Paint Calculator Modal */}
      <PaintCalculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        product={product}
      />

      <style>{`
        @media (max-width: 900px) {
          .product-detail-layout {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
          }
          .related-products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
