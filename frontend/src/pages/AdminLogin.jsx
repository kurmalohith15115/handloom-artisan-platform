import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password, 'admin');
      if (res.success) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Administrator authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper container" style={{ padding: '4.5rem 1rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '460px',
          margin: '0 auto',
          padding: '2.5rem 2rem',
          backgroundColor: '#ffffff',
          borderTop: '4px solid var(--color-indigo)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🛡️</span>
          <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>
            System Administration
          </span>
          <h1 className="heading-serif" style={{ fontSize: '1.8rem', color: 'var(--color-indigo)', margin: '0.25rem 0' }}>
            Admin Console Login
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Restricted to platform administrators and verified platform operators.
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
            <label className="form-label">Administrator Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="admin@handloom-artisan.org"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Security Password *</label>
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
            className="btn btn-indigo"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/login" style={{ color: 'var(--text-muted)' }}>
              👤 Customer Portal
            </Link>
            <span>•</span>
            <Link to="/artisan/login" style={{ color: 'var(--color-terracotta)', fontWeight: '600' }}>
              🎨 Artisan Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
