import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { RatingStars } from '../components/RatingStars';
import { Modal } from '../components/Modal';
import { useLanguage } from '../context/LanguageContext';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');

  // Review modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`),
        ]);

        if (prodRes.success) setProduct(prodRes.product);
        if (revRes.success) setReviews(revRes.reviews || []);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{t('common.loading')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-wrapper container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 className="heading-serif">Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
          This product may have been unlisted or does not exist.
        </p>
        <Link to="/products" className="btn btn-primary">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setAdding(true);
    const res = await addToCart(product, quantity);
    setAdding(false);
    if (res.success) {
      setAddedMessage('✓ Added to shopping cart!');
      setTimeout(() => setAddedMessage(''), 3000);
    } else {
      setAddedMessage(res.message || 'Failed to add item');
      setTimeout(() => setAddedMessage(''), 3000);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: ratingInput,
        comment: commentInput,
      });

      if (res.success) {
        setReviewSuccess('Thank you! Your verified purchase review has been published.');
        setCommentInput('');
        // Refresh reviews and product rating
        const updatedRev = await api.get(`/reviews/product/${product._id}`);
        if (updatedRev.success) setReviews(updatedRev.reviews || []);
        setTimeout(() => setReviewModalOpen(false), 2000);
      }
    } catch (err) {
      setReviewError(err.message || 'Could not submit review. Verified purchase required.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const activeImage =
    product.images && product.images[activeImageIndex]
      ? product.images[activeImageIndex].startsWith('http')
        ? product.images[activeImageIndex]
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.images[activeImageIndex]}`
      : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/">Home</Link> / <Link to="/products">All Products</Link> /{' '}
          <Link to={`/products?category=${product.category?.slug}`}>{product.category?.name}</Link> /{' '}
          <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{product.title}</span>
        </div>

        {/* Product Hero Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem',
          }}
        >
          {/* Gallery Column */}
          <div>
            <div
              className="card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '4/4',
                backgroundColor: 'var(--bg-secondary)',
                marginBottom: '1rem',
              }}
            >
              <img
                src={activeImage}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {discount && (
                <span
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: 'var(--color-terracotta)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '9999px',
                  }}
                >
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail row if multiple photos */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: activeImageIndex === idx ? '2px solid var(--color-terracotta)' : '1px solid var(--border-light)',
                      padding: 0,
                      background: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img}`}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-terracotta">
                {product.category?.name || 'Handloom Heritage'}
              </span>
              <span className="badge badge-forest">📍 {product.craftOrigin}</span>
            </div>

            <h1 className="heading-serif" style={{ fontSize: '2.1rem', lineHeight: 1.25, marginBottom: '0.75rem' }}>
              {product.title}
            </h1>

            {/* Rating & Review summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <RatingStars rating={product.rating || 5} totalReviews={product.numReviews} size={18} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ({reviews.length} verified reviews)
              </span>
            </div>

            {/* Price section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.75rem',
                padding: '1rem 0',
                borderTop: '1px solid var(--border-light)',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '1.5rem',
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span style={{ fontSize: '1.15rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span style={{ fontSize: '0.82rem', color: 'var(--color-forest)', fontWeight: '600' }}>
                Inclusive of all taxes • Direct artisan fair pricing
              </span>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.96rem' }}>
              {product.description}
            </p>

            {/* Technical Craft Specifications */}
            <div
              className="card"
              style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '1.25rem',
                marginBottom: '1.75rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                fontSize: '0.88rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Material
                </span>
                <strong>{product.material || 'Pure Handloom'}</strong>
              </div>
              {product.dimensions && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                    Dimensions
                  </span>
                  <strong>{product.dimensions}</strong>
                </div>
              )}
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Loom Origin
                </span>
                <strong>{product.craftOrigin}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Stock Status
                </span>
                <strong style={{ color: isOutOfStock ? '#b91c1c' : '#15803d' }}>
                  {isOutOfStock ? 'Sold Out' : `In Stock (${product.stock} pieces)`}
                </strong>
              </div>
            </div>

            {/* Quantity & Buy Buttons */}
            {!isOutOfStock ? (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Quantity:</label>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ padding: '0.5rem 0.85rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0.5rem 1rem', fontWeight: '700', fontSize: '0.95rem' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      style={{ padding: '0.5rem 0.85rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1, minWidth: '180px' }}
                  >
                    {adding ? 'Adding...' : '🛍️ Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="btn btn-indigo btn-lg"
                    style={{ flex: 1, minWidth: '180px' }}
                  >
                    ⚡ Buy Now
                  </button>
                </div>

                {addedMessage && (
                  <p style={{ marginTop: '0.75rem', color: 'var(--color-forest)', fontWeight: '600', fontSize: '0.88rem' }}>
                    {addedMessage}
                  </p>
                )}
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2rem',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                ⚠️ Currently out of stock. Contact the artisan or check back as more pieces are handwoven.
              </div>
            )}

            {/* Artisan Spotlight Card */}
            {product.artisan && (
              <div
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  backgroundColor: 'var(--bg-card-subtle)',
                }}
              >
                <img
                  src={
                    product.artisan.profilePhoto ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={product.artisan.user?.name || 'Artisan'}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--color-terracotta)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-terracotta)', fontWeight: '700', textTransform: 'uppercase' }}>
                    Woven by Master Artisan
                  </span>
                  <h4 style={{ fontSize: '1.05rem', margin: '0.2rem 0' }}>
                    {product.artisan.user?.name}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    {product.artisan.craftType} • {product.artisan.location?.village}, {product.artisan.location?.state}
                  </p>
                </div>
                <Link to={`/artisans/${product.artisan._id}`} className="btn btn-outline btn-sm">
                  View Profile →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section
          style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '3rem',
            marginTop: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 className="heading-serif" style={{ fontSize: '1.8rem' }}>
                Verified Customer Reviews
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Feedback submitted exclusively by patrons who ordered this authentic weave.
              </p>
            </div>

            {isAuthenticated ? (
              <button onClick={() => setReviewModalOpen(true)} className="btn btn-secondary">
                ✍️ Write a Review
              </button>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log in to review
              </Link>
            )}
          </div>

          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="card"
                  style={{ padding: '1.25rem 1.5rem', backgroundColor: '#ffffff' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.6rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-indigo)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                        }}
                      >
                        {rev.customer?.name?.[0] || 'C'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>
                          {rev.customer?.name || 'Verified Buyer'}
                        </strong>
                        <span
                          style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.72rem',
                            color: '#15803d',
                            fontWeight: '600',
                          }}
                        >
                          ✓ Verified Purchase
                        </span>
                      </div>
                    </div>
                    <RatingStars rating={rev.rating} size={14} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    "{rev.comment}"
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
                    Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="card"
              style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#ffffff' }}
            >
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                No customer reviews yet. Be the first to purchase and share feedback for this artisan creation!
              </p>
            </div>
          )}
        </section>

        {/* Write Review Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Share Your Review"
        >
          <form onSubmit={handleSubmitReview}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Our policy ensures only verified buyers can post reviews. Your feedback directly motivates
              traditional handloom weavers.
            </p>

            {reviewError && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {reviewError}
              </div>
            )}

            {reviewSuccess && (
              <div
                style={{
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {reviewSuccess}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Your Rating (1 to 5 Stars):</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingInput(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.8rem',
                      cursor: 'pointer',
                      color: star <= ratingInput ? '#eab308' : '#d1d5db',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Review & Craft Appreciation:</label>
              <textarea
                required
                rows={4}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your experience regarding fabric quality, weave texture, craftsmanship, or delivery..."
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="btn btn-primary"
              >
                {submittingReview ? 'Verifying & Posting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
