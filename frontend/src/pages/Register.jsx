import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Register = () => {
  const { registerCustomer } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    languagePreference: language,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerCustomer(formData);
      if (res.success) {
        navigate('/account');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper container" style={{ padding: '3.5rem 1rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '2.5rem 2rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🧵</span>
          <h1 className="heading-serif" style={{ fontSize: '1.8rem', color: 'var(--color-indigo)', marginBottom: '0.35rem' }}>
            Create Customer Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Join our community of conscious patrons supporting genuine Indian handloom weavers.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder="e.g. Ananya Rao"
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
              placeholder="ananya@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password * (Min 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (Optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="form-input"
              placeholder="+91 98480 12345"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Platform Language</label>
            <select
              value={formData.languagePreference}
              onChange={(e) => setFormData({ ...formData, languagePreference: e.target.value })}
              className="form-select"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center',
            fontSize: '0.88rem',
          }}
        >
          <p style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-terracotta)', fontWeight: '600' }}>
              Sign In
            </Link>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
            Are you a weaver or artisan?{' '}
            <Link to="/artisan/register" style={{ color: 'var(--color-indigo)', fontWeight: '600' }}>
              Register on Artisan Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
