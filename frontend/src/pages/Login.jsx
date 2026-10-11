import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password, 'customer');
      if (res.success) {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper container" style={{ padding: '4rem 1rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '460px',
          margin: '0 auto',
          padding: '2.5rem 2rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🧵</span>
          <h1 className="heading-serif" style={{ fontSize: '1.8rem', color: 'var(--color-indigo)', marginBottom: '0.35rem' }}>
            Customer Sign In
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Access your orders, saved addresses and authentic handloom cart.
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
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@domain.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
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
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            New to Handloom Artisan?{' '}
            <Link to="/register" style={{ color: 'var(--color-terracotta)', fontWeight: '600' }}>
              Create an account
            </Link>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.82rem', marginTop: '1rem' }}>
            <Link to="/artisan/login" style={{ color: 'var(--color-terracotta)', fontWeight: '600' }}>
              🧵 Artisan Login
            </Link>
            <span>•</span>
            <Link to="/admin/login" style={{ color: 'var(--color-indigo)', fontWeight: '600' }}>
              🛡️ Admin Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
