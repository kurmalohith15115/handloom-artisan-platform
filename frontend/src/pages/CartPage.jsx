import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const CartPage = () => {
  const { cartItems, subtotal, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const shippingFee = subtotal >= 1999 ? 0 : subtotal > 0 ? 99 : 0;
  const grandTotal = subtotal + shippingFee;
  const freeShippingThreshold = 1999;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (cartItems.length === 0) {
    return (
      <div className="page-wrapper container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="card" style={{ maxWidth: '520px', margin: '0 auto', padding: '3.5rem 2rem' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>🛍️</span>
          <h2 className="heading-serif" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            {t('cart.empty')}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            {t('cart.emptySubtitle')}
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            {t('cart.startShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="heading-serif" style={{ fontSize: '2.4rem', marginBottom: '2rem', color: 'var(--color-indigo)' }}>
          {t('cart.title')} ({totalItems} items)
        </h1>

        {/* Free Shipping Progress Indicator */}
        <div
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            backgroundColor: subtotal >= freeShippingThreshold ? '#f0fdf4' : 'var(--bg-secondary)',
            border: subtotal >= freeShippingThreshold ? '1px solid #86efac' : '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: '600' }}>
            <span>
              {subtotal >= freeShippingThreshold
                ? '🎉 Congratulations! You have unlocked FREE Pan-India Shipping!'
                : `Add ₹${amountNeededForFreeShipping.toLocaleString('en-IN')} more to unlock FREE Pan-India Shipping!`}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: subtotal >= freeShippingThreshold ? '#15803d' : 'var(--color-terracotta)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Cart Items List Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item) => {
              const prod = item.product;
              if (!prod) return null;

              const imageSrc =
                prod.images && prod.images[0]
                  ? prod.images[0].startsWith('http')
                    ? prod.images[0]
                    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${prod.images[0]}`
                  : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';

              return (
                <div
                  key={prod._id || item._id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <img
                    src={imageSrc}
                    alt={prod.title}
                    style={{
                      width: '90px',
                      height: '90px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <Link
                      to={`/products/${prod._id}`}
                      style={{
                        fontWeight: '600',
                        fontSize: '1rem',
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {prod.title}
                    </Link>

                    {prod.craftOrigin && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                        📍 {prod.craftOrigin}
                      </span>
                    )}

                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-terracotta)' }}>
                      ₹{prod.price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(prod._id, item.quantity - 1)}
                      style={{ padding: '0.35rem 0.65rem', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0.35rem 0.65rem', fontWeight: '600', fontSize: '0.88rem' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(prod._id, item.quantity + 1)}
                      style={{ padding: '0.35rem 0.65rem', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(prod._id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-light)',
                      cursor: 'pointer',
                      fontSize: '1.15rem',
                      padding: '0.5rem',
                    }}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <Link to="/products" className="btn btn-secondary btn-sm">
                ← Continue Shopping
              </Link>
              <button onClick={clearCart} className="btn btn-outline btn-sm">
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              Order Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Items Subtotal</span>
                <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pan-India Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong style={{ color: 'var(--color-forest)' }}>FREE</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>GI Craft Verification</span>
                <span style={{ color: 'var(--color-forest)', fontWeight: '600' }}>Included</span>
              </div>
            </div>

            <div
              style={{
                borderTop: '2px solid var(--border-light)',
                paddingTop: '1rem',
                marginBottom: '1.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total Amount</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-indigo)' }}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              🔒 {t('cart.checkout')} →
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              🛡️ 100% Secure Checkout via Razorpay. Direct payments disbursed to authentic master weavers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
