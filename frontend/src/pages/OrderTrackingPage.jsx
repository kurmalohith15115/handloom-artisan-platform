import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

const ORDER_STEPS = [
  'Pending Payment',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const OrderTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrackOrder = async (numberToTrack) => {
    if (!numberToTrack) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/track/${encodeURIComponent(numberToTrack.trim())}`);
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError('No order found with this order number. Please verify and try again.');
        setOrder(null);
      }
    } catch (err) {
      setError(err.message || 'Order tracking lookup failed.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchTrackOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      setSearchParams({ orderNumber: orderNumberInput.trim() });
      fetchTrackOrder(orderNumberInput.trim());
    }
  };

  // Determine current active step index
  const getCurrentStepIndex = () => {
    if (!order) return -1;
    if (order.orderStatus === 'Cancelled') return -2;
    const idx = ORDER_STEPS.indexOf(order.orderStatus);
    return idx !== -1 ? idx : 1;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '820px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>
            Real-Time Loom-to-Doorstep Tracking
          </span>
          <h1 className="heading-serif" style={{ fontSize: '2.3rem', color: 'var(--color-indigo)' }}>
            Track Your Handloom Order
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Enter your order reference number (e.g. HLO-XXXX-XXXX) to track fulfillment and shipping status.
          </p>
        </div>

        {/* Tracking Search Form */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', backgroundColor: '#ffffff' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              required
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              placeholder="e.g. HLO-2026-..."
              className="form-input"
              style={{ flex: 1, minWidth: '220px' }}
            />
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Searching...' : '🔍 Track Status'}
            </button>
          </form>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Tracked Order Details */}
        {order && (
          <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Reference</span>
                <h3 className="heading-serif" style={{ fontSize: '1.4rem', margin: 0, color: 'var(--color-indigo)' }}>
                  {order.orderNumber}
                </h3>
              </div>
              <StatusBadge status={order.orderStatus} />
            </div>

            {/* Visual Step Progress Bar */}
            {order.orderStatus === 'Cancelled' ? (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                ✖ This order has been cancelled.
              </div>
            ) : (
              <div style={{ marginBottom: '3rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    position: 'relative',
                    marginBottom: '1rem',
                  }}
                >
                  {/* Connecting Progress Line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '20px',
                      right: '20px',
                      height: '4px',
                      backgroundColor: '#e2e8f0',
                      zIndex: 0,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: 'var(--color-terracotta)',
                        width: `${(Math.max(0, currentStep) / (ORDER_STEPS.length - 1)) * 100}%`,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  {ORDER_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div
                        key={step}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          zIndex: 1,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--color-terracotta)' : '#ffffff',
                            color: isCompleted ? '#ffffff' : '#94a3b8',
                            border: isCurrent ? '3px solid var(--color-indigo)' : isCompleted ? 'none' : '2px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            textAlign: 'center',
                            fontWeight: isCurrent ? '700' : isCompleted ? '600' : '400',
                            color: isCurrent ? 'var(--color-indigo)' : isCompleted ? 'var(--text-main)' : 'var(--text-light)',
                          }}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courier / Tracking Dispatch Details if shipped */}
            {(order.trackingNumber || order.carrier) && (
              <div
                className="card"
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-secondary)',
                  marginBottom: '2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Courier Carrier</span>
                  <div style={{ fontWeight: '700' }}>{order.carrier || 'India Post Speed Post'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Waybill / Tracking ID</span>
                  <div style={{ fontWeight: '700', color: 'var(--color-terracotta)' }}>{order.trackingNumber}</div>
                </div>
              </div>
            )}

            {/* Chronological Status History Log */}
            <div>
              <h4 className="heading-serif" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                Timeline & Updates
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.statusHistory &&
                  order.statusHistory.map((hist, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.88rem',
                      }}
                    >
                      <span style={{ color: 'var(--color-terracotta)', fontWeight: '700', minWidth: '120px' }}>
                        {hist.status}
                      </span>
                      <span style={{ flex: 1, color: 'var(--text-muted)' }}>{hist.note}</span>
                      <span style={{ color: 'var(--text-light)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {new Date(hist.timestamp).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
