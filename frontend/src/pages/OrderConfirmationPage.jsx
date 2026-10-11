import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.success) setOrder(res.order);
      } catch (err) {
        console.error('Failed to load order confirmation details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="page-wrapper container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-wrapper container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 className="heading-serif">Order Details Unavailable</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Celebration Header Card */}
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            ✓
          </div>

          <h1 className="heading-serif" style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--color-indigo)' }}>
            Order Placed & Payment Verified!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Thank you for supporting traditional Indian weavers. Your order has been registered and
            the artisan has been notified to begin careful packaging.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              fontWeight: '600',
            }}
          >
            <span>Order Number:</span>
            <span style={{ color: 'var(--color-terracotta)', letterSpacing: '0.04em' }}>
              {order.orderNumber}
            </span>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            <div>
              <h3 className="heading-serif" style={{ fontSize: '1.3rem', margin: 0 }}>
                Order Summary
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <StatusBadge status={order.orderStatus} />
          </div>

          {/* Purchased Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                {item.image && (
                  <img
                    src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${item.image}`}
                    alt={item.title}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ fontWeight: '700', fontSize: '1rem' }}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Totals & Delivery Address */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Delivery Destination
              </h4>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                <strong>{order.shippingAddress.fullName}</strong>
                <div>{order.shippingAddress.addressLine1}</div>
                {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </div>
                <div>Phone: {order.shippingAddress.phone}</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Payment Information
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                <span>Payment Method:</span>
                <strong>Razorpay</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                <span>Payment Status:</span>
                <span style={{ color: '#15803d', fontWeight: '700' }}>Confirmed (Paid)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', marginTop: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                <span>Total Paid:</span>
                <span style={{ color: 'var(--color-terracotta)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to={`/order-tracking?orderNumber=${order.orderNumber}`} className="btn btn-primary btn-lg">
            📍 Track Real-Time Delivery Timeline
          </Link>
          <Link to="/products" className="btn btn-secondary btn-lg">
            Continue Browsing Weaves
          </Link>
        </div>
      </div>
    </div>
  );
};
