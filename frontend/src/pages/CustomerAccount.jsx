import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useLanguage } from '../context/LanguageContext';

export const CustomerAccount = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Profile update form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileLang, setProfileLang] = useState(user?.languagePreference || 'en');
  const [profileMessage, setProfileMessage] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Address modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  });

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductToReview, setSelectedProductToReview] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchAddresses();
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/orders/my-orders');
      if (res.success) setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.get('/addresses');
      if (res.success) setAddresses(res.addresses || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      await updateUserProfile({
        name: profileName,
        phone: profilePhone,
        languagePreference: profileLang,
      });
      setLanguage(profileLang);
      setProfileMessage('✓ Profile information updated successfully.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      setProfileMessage(`Error: ${err.message}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.success) {
        setPasswordMessage('✓ Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPasswordMessage(''), 3000);
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', addressForm);
      if (res.success) {
        setAddressModalOpen(false);
        fetchAddresses();
        setAddressForm({
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          isDefault: false,
        });
      }
    } catch (err) {
      alert(`Could not save address: ${err.message}`);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to delete this delivery address?')) return;
    try {
      await api.delete(`/addresses/${addrId}`);
      fetchAddresses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Please enter the reason for cancelling this order:');
    if (!reason) return;

    try {
      const res = await api.post(`/orders/${orderId}/cancel`, { reason });
      if (res.success) {
        alert('Order has been cancelled successfully. Any payment will be queued for refund.');
        fetchOrders();
      }
    } catch (err) {
      alert(`Cannot cancel order: ${err.message}`);
    }
  };

  const openReviewModal = (product) => {
    setSelectedProductToReview(product);
    setRatingInput(5);
    setCommentInput('');
    setReviewMessage('');
    setReviewError('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewMessage('');

    try {
      const res = await api.post('/reviews', {
        productId: selectedProductToReview._id || selectedProductToReview,
        rating: ratingInput,
        comment: commentInput,
      });

      if (res.success) {
        setReviewMessage('✓ Thank you! Your verified purchase review has been published.');
        setTimeout(() => setReviewModalOpen(false), 2000);
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
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
            <h1 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--color-indigo)', margin: 0 }}>
              My Account
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              Logged in as <strong>{user?.name}</strong> ({user?.email})
            </p>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm" style={{ color: '#b91c1c' }}>
            🚪 Log Out
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '2px solid var(--border-light)',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'orders' ? 'var(--color-terracotta)' : 'var(--text-muted)',
              borderBottom: activeTab === 'orders' ? '3px solid var(--color-terracotta)' : 'none',
              marginBottom: '-2px',
            }}
          >
            📦 Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'addresses' ? 'var(--color-terracotta)' : 'var(--text-muted)',
              borderBottom: activeTab === 'addresses' ? '3px solid var(--color-terracotta)' : 'none',
              marginBottom: '-2px',
            }}
          >
            📍 Saved Addresses ({addresses.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'profile' ? 'var(--color-terracotta)' : 'var(--text-muted)',
              borderBottom: activeTab === 'profile' ? '3px solid var(--color-terracotta)' : 'none',
              marginBottom: '-2px',
            }}
          >
            ⚙️ Profile & Password
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner" />
              </div>
            ) : orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map((order) => {
                  const canCancel = ['Pending Payment', 'Confirmed', 'Processing'].includes(order.orderStatus);

                  return (
                    <div key={order._id} className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '1rem',
                          borderBottom: '1px solid var(--border-light)',
                          paddingBottom: '1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--color-indigo)' }}>
                              #{order.orderNumber}
                            </strong>
                            <StatusBadge status={order.orderStatus} />
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-terracotta)' }}>
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </span>
                          <div style={{ fontSize: '0.78rem', color: order.paymentStatus === 'paid' ? '#15803d' : '#b45309', fontWeight: '600' }}>
                            {order.paymentStatus === 'paid' ? 'Paid via Razorpay' : 'Pending Payment'}
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {item.image && (
                              <img
                                src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${item.image}`}
                                alt={item.title}
                                style={{ width: '56px', height: '56px', borderRadius: '4px', objectFit: 'cover' }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>{item.title}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                              </div>
                            </div>

                            {/* Review button if paid/delivered */}
                            {order.paymentStatus === 'paid' && (
                              <button
                                onClick={() => openReviewModal(item.product)}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.75rem' }}
                              >
                                ★ Review
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid var(--border-light)',
                          paddingTop: '0.75rem',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Delivery: {order.shippingAddress.fullName}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            to={`/order-tracking?orderNumber=${order.orderNumber}`}
                            className="btn btn-secondary btn-sm"
                          >
                            📍 Track Timeline
                          </Link>

                          {canCancel && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="btn btn-sm"
                              style={{ color: '#b91c1c', border: '1px solid #fecaca', background: '#fee2e2' }}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card" style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>📦</span>
                <h3 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                  No Orders Placed Yet
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Explore authentic traditional weaves and support master weavers directly.
                </p>
                <Link to="/products" className="btn btn-primary">
                  Explore Handlooms
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADDRESSES */}
        {activeTab === 'addresses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="heading-serif" style={{ fontSize: '1.4rem', margin: 0 }}>
                Saved Shipping Destinations
              </h3>
              <button onClick={() => setAddressModalOpen(true)} className="btn btn-primary btn-sm">
                + Add New Address
              </button>
            </div>

            {loadingAddresses ? (
              <div className="spinner" />
            ) : addresses.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {addresses.map((addr) => (
                  <div key={addr._id} className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff', position: 'relative' }}>
                    {addr.isDefault && (
                      <span className="badge badge-success" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                        Default Address
                      </span>
                    )}
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{addr.fullName}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 0.5rem' }}>
                      Phone: {addr.phone}
                    </p>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                      {addr.addressLine1}
                      {addr.addressLine2 && <><br />{addr.addressLine2}</>}
                      <br />
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="btn btn-sm btn-secondary"
                      style={{ color: '#b91c1c' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  You have no saved delivery addresses yet.
                </p>
                <button onClick={() => setAddressModalOpen(true)} className="btn btn-primary">
                  + Add Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE & PASSWORD */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {/* Edit Profile Form */}
            <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
              <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
                Personal Information
              </h3>

              {profileMessage && (
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {profileMessage}
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="form-input"
                    style={{ backgroundColor: '#f1f5f9' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Platform Language</label>
                  <select
                    value={profileLang}
                    onChange={(e) => setProfileLang(e.target.value)}
                    className="form-select"
                  >
                    <option value="en">English</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  Save Profile Changes
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
              <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
                Security & Password
              </h3>

              {passwordMessage && (
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {passwordMessage}
                </div>
              )}

              {passwordError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password * (Min 6 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button type="submit" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Address Modal */}
        <Modal
          isOpen={addressModalOpen}
          onClose={() => setAddressModalOpen(false)}
          title="Add New Delivery Address"
        >
          <form onSubmit={handleSaveAddress}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                required
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street Address / House *</label>
              <input
                type="text"
                required
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Area / Landmark</label>
              <input
                type="text"
                value={addressForm.addressLine2}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  required
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">PIN Code *</label>
              <input
                type="text"
                required
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                className="form-input"
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              />
              <span style={{ fontSize: '0.88rem' }}>Set as default delivery address</span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setAddressModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Address
              </button>
            </div>
          </form>
        </Modal>

        {/* Review Submission Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Write Verified Review"
        >
          <form onSubmit={handleSubmitReview}>
            {reviewError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {reviewError}
              </div>
            )}
            {reviewMessage && (
              <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {reviewMessage}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Rating (1 to 5 Stars):</label>
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
              <label className="form-label">Review Comment *</label>
              <textarea
                required
                rows={4}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="form-textarea"
                placeholder="How was the handloom quality, weave authenticity, and delivery experience?"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setReviewModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Post Review
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
