import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ContactSupport = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: '',
    category: 'general',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/support', formData);
      if (res.success) {
        setSuccessMsg('✓ Your support request has been submitted. Our team will get back to you within 24 hours.');
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          subject: '',
          message: '',
          category: 'general',
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
            We're Here to Help
          </span>
          <h1 className="heading-serif" style={{ fontSize: '2.6rem', color: 'var(--color-indigo)', marginBottom: '1rem' }}>
            Customer & Artisan Support Desk
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Have a question regarding order tracking, GI craft authenticity, custom sizes, or artisan onboarding?
            Reach out to our dedicated support team.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Support Form */}
          <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
              Send Us a Message
            </h3>

            {successMsg && (
              <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Topic *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-select"
                >
                  <option value="general">General Marketplace Inquiry</option>
                  <option value="order">Order Tracking & Delivery Status</option>
                  <option value="payment">Payment & Razorpay Inquiries</option>
                  <option value="artisan">Artisan Partnership & Onboarding</option>
                  <option value="craft">Craft Customization / Bulk Orders</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="form-input"
                  placeholder="Summary of your question"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-textarea"
                  placeholder="Please provide details such as your order number or specific craft questions..."
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                {loading ? 'Submitting...' : 'Submit Support Request'}
              </button>
            </form>
          </div>

          {/* Contact Details Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
              <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-indigo)' }}>
                Artisan Support Hub
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Our field coordinators regularly visit weaving clusters in Pochampally, Chirala, and Srikalahasti.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-main)' }}>📧 Support Email</strong>
                  <span style={{ color: 'var(--color-terracotta)' }}>support@handloom-artisan.org</span>
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-main)' }}>📞 Helpline & WhatsApp</strong>
                  <span style={{ color: 'var(--text-muted)' }}>+91 98480 12345 (Mon - Sat, 9am - 7pm IST)</span>
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-main)' }}>📍 Heritage Office</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Weavers Colony, Bhoodan Pochampally, Yadadri Bhuvanagiri, Telangana - 508284</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
              <h4 className="heading-serif" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                ⚡ Quick Self-Service
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                Track delivery stages instantly using your order reference.
              </p>
              <a href="/order-tracking" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Go to Order Tracking →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
