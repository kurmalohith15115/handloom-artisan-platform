import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Verifying credentials...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (requiredRole === 'artisan') {
      return <Navigate to="/artisan/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (requiredRole && role !== requiredRole) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div
          className="card"
          style={{ maxWidth: '520px', margin: '0 auto', padding: '2.5rem 2rem' }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-terracotta-light)',
              color: 'var(--color-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 1.25rem',
            }}
          >
            🔒
          </div>
          <h2 className="heading-serif" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            This portal is restricted to accounts with the <strong>{requiredRole}</strong> role. You
            are currently logged in as a <strong>{role}</strong> ({user.email}).
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <a href="/" className="btn btn-secondary">
              Go to Home
            </a>
            {role === 'artisan' && (
              <a href="/artisan/dashboard" className="btn btn-primary">
                My Artisan Dashboard
              </a>
            )}
            {role === 'customer' && (
              <a href="/account" className="btn btn-primary">
                My Customer Account
              </a>
            )}
            {role === 'admin' && (
              <a href="/admin/dashboard" className="btn btn-primary">
                Admin Console
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
};
