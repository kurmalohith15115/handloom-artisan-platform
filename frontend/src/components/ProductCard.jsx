import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { RatingStars } from './RatingStars';
import { useLanguage } from '../context/LanguageContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    await addToCart(product, 1);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const imageSrc =
    product.images && product.images[0]
      ? product.images[0].startsWith('http')
        ? product.images[0]
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${product.images[0]}`
      : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Link
        to={`/products/${product._id}`}
        style={{ position: 'relative', display: 'block', overflow: 'hidden', aspectRatio: '4/4.5', backgroundColor: '#f5efe6' }}
      >
        <img
          src={imageSrc}
          alt={product.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Craft Origin Pill */}
        {product.craftOrigin && (
          <span
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              backgroundColor: 'rgba(26, 43, 73, 0.88)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: '600',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              backdropFilter: 'blur(4px)',
            }}
          >
            📍 {product.craftOrigin.split(',')[0]}
          </span>
        )}

        {/* Discount Badge */}
        {discount && (
          <span
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              backgroundColor: 'var(--color-terracotta)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
            }}
          >
            {discount}% OFF
          </span>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                backgroundColor: '#ffffff',
                color: '#b91c1c',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '700',
                fontSize: '0.85rem',
              }}
            >
              {t('product.outOfStock')}
            </span>
          </div>
        )}
      </Link>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.35rem',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--color-terracotta)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {product.category?.name || 'Traditional Weave'}
          </span>
          <RatingStars rating={product.rating || 5} totalReviews={product.numReviews} size={13} />
        </div>

        {/* Title */}
        <h4
          style={{
            fontSize: '0.98rem',
            fontWeight: '600',
            lineHeight: 1.35,
            marginBottom: '0.4rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          <Link to={`/products/${product._id}`} style={{ color: 'var(--text-main)' }}>
            {product.title}
          </Link>
        </h4>

        {/* Artisan byline */}
        {product.artisan?.user?.name && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {t('product.artisan')} <strong style={{ color: 'var(--text-main)' }}>{product.artisan.user.name}</strong>
          </p>
        )}

        {/* Price & Action */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-light)',
                    textDecoration: 'line-through',
                  }}
                >
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-forest)', fontWeight: '600' }}>
              GI Certified Weave
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
            className={`btn btn-sm ${added ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              backgroundColor: added ? '#dcfce7' : undefined,
              color: added ? '#15803d' : undefined,
              borderColor: added ? '#86efac' : undefined,
            }}
          >
            {added ? '✓ Added' : adding ? 'Adding...' : isOutOfStock ? 'Sold' : t('product.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
};
