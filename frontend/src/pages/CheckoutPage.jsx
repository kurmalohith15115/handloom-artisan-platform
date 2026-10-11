import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';

export const CheckoutPage = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500081',
    country: 'India',
  });

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sandbox simulation payment modal
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [pendingOrderInfo, setPendingOrderInfo] = useState(null);

  const shippingFee = subtotal >= 1999 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  useEffect(() => {
    if (isAuthenticated) {
      const loadAddresses = async () => {
        try {
          const res = await api.get('/addresses');
          if (res.success && res.addresses && res.addresses.length > 0) {
            setSavedAddresses(res.addresses);
            const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
            setSelectedAddressId(defaultAddr._id);
            setShippingAddress({
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              addressLine1: defaultAddr.addressLine1,
              addressLine2: defaultAddr.addressLine2 || '',
              city: defaultAddr.city,
              state: defaultAddr.state,
              postalCode: defaultAddr.postalCode,
              country: defaultAddr.country || 'India',
            });
          }
        } catch (err) {
          console.warn('Could not fetch saved addresses:', err);
        }
      };
      loadAddresses();
    }
  }, [isAuthenticated]);

  const handleAddressSelect = (addrId) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setShippingAddress({
        fullName: user?.name || '',
        phone: user?.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500081',
        country: 'India',
      });
    } else {
      const selected = savedAddresses.find((a) => a._id === addrId);
      if (selected) {
        setShippingAddress({
          fullName: selected.fullName,
          phone: selected.phone,
          addressLine1: selected.addressLine1,
          addressLine2: selected.addressLine2 || '',
          city: selected.city,
          state: selected.state,
          postalCode: selected.postalCode,
          country: selected.country || 'India',
        });
      }
    }
  };

  const handlePaymentVerification = async (verificationPayload) => {
    try {
      const verifyRes = await api.post('/payments/verify', verificationPayload);
      if (verifyRes.success) {
        clearCart();
        navigate(`/order-confirmation/${verifyRes.order._id}`);
      } else {
        setErrorMessage(verifyRes.message || 'Payment signature verification failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment verification encountered an error.');
    } finally {
      setProcessing(false);
      setSandboxModalOpen(false);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      setErrorMessage('Please complete all required shipping address fields.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create order and Razorpay order on backend
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
      };

      const orderRes = await api.post('/orders', orderPayload);

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to place order');
      }

      const { order, razorpayOrder } = orderRes;

      // 2. Check if operating in simulated test mode or real Razorpay
      if (razorpayOrder.isSimulated || !window.Razorpay) {
        // Open transparent Sandbox Simulation modal
        setPendingOrderInfo({ order, razorpayOrder });
        setSandboxModalOpen(true);
        setProcessing(false);
        return;
      }

      // 3. Real Razorpay Checkout flow
      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Handloom Artisan Support Platform',
        description: `Order #${razorpayOrder.orderNumber}`,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80',
        order_id: razorpayOrder.id,
        prefill: {
          name: shippingAddress.fullName,
          email: user?.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#a33e26', // Terracotta theme
        },
        handler: async (response) => {
          await handlePaymentVerification({
            orderId: order._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setErrorMessage('Payment was dismissed before completion. You can retry anytime.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setProcessing(false);
        setErrorMessage(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      setProcessing(false);
      setErrorMessage(err.message || 'Failed to initialize payment gateway.');
    }
  };

  const handleSimulateSandboxPayment = async () => {
    if (!pendingOrderInfo) return;
    setProcessing(true);
    const { order, razorpayOrder } = pendingOrderInfo;

    const simulatedPaymentId = `pay_sim_${Date.now()}`;
    const simulatedSignature = `sig_sim_${razorpayOrder.id}_${simulatedPaymentId}`;

    await handlePaymentVerification({
      orderId: order._id,
      razorpay_order_id: razorpayOrder.id,
      razorpay_payment_id: simulatedPaymentId,
      razorpay_signature: simulatedSignature,
    });
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="heading-serif" style={{ fontSize: '2.4rem', marginBottom: '2rem', color: 'var(--color-indigo)' }}>
          Secure Checkout
        </h1>

        {!isAuthenticated && (
          <div
            className="card"
            style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <strong>Already have a customer account?</strong>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Log in to checkout using your saved delivery addresses.
              </p>
            </div>
            <Link to="/login?redirect=/checkout" className="btn btn-primary btn-sm">
              Log In Now
            </Link>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem',
              fontSize: '0.92rem',
              border: '1px solid #fecaca',
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'start',
            }}
          >
            {/* Shipping Address Column */}
            <div>
              {savedAddresses.length > 0 && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#ffffff' }}>
                  <h3 className="heading-serif" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                    Select Delivery Destination
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr._id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          border: selectedAddressId === addr._id ? '2px solid var(--color-terracotta)' : '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          backgroundColor: selectedAddressId === addr._id ? 'var(--color-terracotta-light)' : '#ffffff',
                        }}
                      >
                        <input
                          type="radio"
                          name="addressChoice"
                          checked={selectedAddressId === addr._id}
                          onChange={() => handleAddressSelect(addr._id)}
                          style={{ marginTop: '3px' }}
                        />
                        <div style={{ fontSize: '0.88rem' }}>
                          <strong>{addr.fullName}</strong> ({addr.phone})
                          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                            {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                          </div>
                        </div>
                      </label>
                    ))}

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        border: selectedAddressId === 'new' ? '2px solid var(--color-terracotta)' : '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        backgroundColor: selectedAddressId === 'new' ? 'var(--color-terracotta-light)' : '#ffffff',
                      }}
                    >
                      <input
                        type="radio"
                        name="addressChoice"
                        checked={selectedAddressId === 'new'}
                        onChange={() => handleAddressSelect('new')}
                      />
                      <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>+ Enter a New Address</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Address Form Inputs */}
              <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
                <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
                  Shipping & Delivery Address
                </h3>

                <div className="form-group">
                  <label className="form-label">Full Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Ramesh Varma"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number * (For Delivery Updates)</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="form-input"
                    placeholder="e.g. +91 98480 12345"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address / House / Flat *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    className="form-input"
                    placeholder="Plot No, Street, Colony, Village/Town"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark / Area (Optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                    className="form-input"
                    placeholder="Near Temple / Opposite Post Office"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City / District *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Postal PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="form-input"
                      placeholder="e.g. 508284"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      readOnly
                      value="India"
                      className="form-input"
                      style={{ backgroundColor: '#f1f5f9' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Review & Payment CTA Column */}
            <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
              <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                Order Summary ({cartItems.length} items)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                {cartItems.map((item) => (
                  <div key={item.product?._id || item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                      <span style={{ fontWeight: '600' }}>{item.product?.title}</span>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                        Qty: {item.quantity} × ₹{item.product?.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span style={{ fontWeight: '700' }}>
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
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
                  <span style={{ color: 'var(--text-muted)' }}>GI Certification & Tax</span>
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
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total Payable</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-terracotta)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                disabled={processing || cartItems.length === 0}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {processing ? 'Processing Payment...' : '🔒 Pay via Razorpay Checkout'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>🛡️</span>
                <span>Supported: UPI, GooglePay, PhonePe, RuPay, Visa, NetBanking</span>
              </div>
            </div>
          </div>
        </form>

        {/* Razorpay Sandbox Simulation Modal */}
        <Modal
          isOpen={sandboxModalOpen}
          onClose={() => setSandboxModalOpen(false)}
          title="Razorpay Payment Gateway — Sandbox Mode"
        >
          <div>
            <div
              style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.88rem',
                lineHeight: 1.5,
              }}
            >
              <strong>Payment Gateway Sandbox Notice:</strong>
              <p style={{ margin: '0.35rem 0 0' }}>
                The payment integration is running in sandbox verification mode until your live
                Razorpay API keys are configured in backend environment variables.
              </p>
            </div>

            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Order Reference:</span>
                <strong>{pendingOrderInfo?.order?.orderNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Razorpay Order ID:</span>
                <code>{pendingOrderInfo?.razorpayOrder?.id}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '700', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span>Amount:</span>
                <span style={{ color: 'var(--color-terracotta)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Clicking below will simulate a successful customer authorization and send the cryptographic
              signature payload to the backend server for verification, stock deduction, and order confirmation.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setSandboxModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateSandboxPayment}
                disabled={processing}
                className="btn btn-primary"
              >
                {processing ? 'Verifying Signature...' : '✓ Authorize Test Payment'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
