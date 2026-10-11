import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--bg-card)' }}>
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: 'var(--color-indigo)',
          color: '#ffffff',
          fontSize: '0.8rem',
          padding: '0.4rem 1rem',
          textAlign: 'center',
          fontWeight: '500',
          letterSpacing: '0.02em',
        }}
      >
        <span>🇮🇳 Direct Handloom Marketplace — 100% Weaver Proceeds • GI Certified Authentic Heritage Crafts</span>
      </div>

      {/* Main Navigation Bar */}
      <div
        style={{
          borderBottom: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          className="container-wide"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            gap: '1rem',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-terracotta)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 6px rgba(163, 62, 38, 0.3)',
              }}
            >
              🧵
            </span>
            <div>
              <span
                className="heading-serif"
                style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: 'var(--color-indigo)',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                Handloom Artisan
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--color-terracotta)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                }}
              >
                Heritage Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            style={{
              flex: 1,
              maxWidth: '460px',
              display: 'flex',
              position: 'relative',
            }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('nav.search')}
              style={{
                width: '100%',
                padding: '0.55rem 2.5rem 0.55rem 1rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-primary)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-terracotta)',
                fontSize: '1.05rem',
                padding: '0.2rem',
              }}
              aria-label="Search"
            >
              🔍
            </button>
          </form>

          {/* Right Header Utilities */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Language Switcher */}
            <div
              style={{
                display: 'inline-flex',
                border: '1px solid var(--border-light)',
                borderRadius: '9999px',
                overflow: 'hidden',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
            >
              <button
                onClick={() => setLanguage('en')}
                style={{
                  padding: '0.3rem 0.6rem',
                  border: 'none',
                  backgroundColor: language === 'en' ? 'var(--color-terracotta)' : 'transparent',
                  color: language === 'en' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('te')}
                style={{
                  padding: '0.3rem 0.6rem',
                  border: 'none',
                  backgroundColor: language === 'te' ? 'var(--color-terracotta)' : 'transparent',
                  color: language === 'te' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                తెలుగు
              </button>
            </div>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                fontWeight: '500',
              }}
            >
              <span>🛍️</span>
              <span className="hide-on-mobile">{t('nav.cart')}</span>
              {totalItems > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--color-terracotta)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Dropdown / Login */}
            <div style={{ position: 'relative' }}>
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-card)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span>👤</span>
                    <span style={{ fontWeight: '600' }}>{user.name.split(' ')[0]}</span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        backgroundColor:
                          role === 'admin'
                            ? '#fee2e2'
                            : role === 'artisan'
                            ? '#fef3c7'
                            : '#dbeafe',
                        color:
                          role === 'admin'
                            ? '#991b1b'
                            : role === 'artisan'
                            ? '#92400e'
                            : '#1e40af',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                      }}
                    >
                      {role}
                    </span>
                    <span style={{ fontSize: '0.7rem' }}>▼</span>
                  </button>

                  {userDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 6px)',
                        width: '220px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        padding: '0.5rem 0',
                        zIndex: 200,
                      }}
                    >
                      <div
                        style={{
                          padding: '0.6rem 1rem',
                          borderBottom: '1px solid var(--border-light)',
                          fontSize: '0.8rem',
                        }}
                      >
                        <div style={{ fontWeight: '600' }}>{user.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</div>
                      </div>

                      {role === 'customer' && (
                        <>
                          <Link
                            to="/account"
                            onClick={() => setUserDropdownOpen(false)}
                            style={{ display: 'block', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            📦 My Orders & Addresses
                          </Link>
                          <Link
                            to="/account"
                            onClick={() => setUserDropdownOpen(false)}
                            style={{ display: 'block', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            ⚙️ Profile Settings
                          </Link>
                        </>
                      )}

                      {role === 'artisan' && (
                        <Link
                          to="/artisan/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{ display: 'block', padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--color-terracotta)', fontWeight: '600' }}
                        >
                          🎨 Artisan Studio Dashboard
                        </Link>
                      )}

                      {role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{ display: 'block', padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#b91c1c', fontWeight: '600' }}
                        >
                          🛡️ Admin Control Console
                        </Link>
                      )}

                      <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.35rem' }}>
                        <button
                          onClick={handleLogout}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            background: 'none',
                            color: '#b91c1c',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                          }}
                        >
                          🚪 {t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category & Page Quick Navigation Bar */}
        <nav
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-light)',
            overflowX: 'auto',
          }}
        >
          <div
            className="container-wide"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '0.5rem 1.25rem',
              fontSize: '0.88rem',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            <Link to="/" style={{ color: 'var(--text-main)', fontWeight: '600' }}>
              {t('nav.home')}
            </Link>
            <Link to="/products" style={{ color: 'var(--text-main)' }}>
              {t('nav.allProducts')}
            </Link>
            <Link to="/categories" style={{ color: 'var(--text-main)' }}>
              {t('nav.categories')}
            </Link>
            <Link to="/artisans" style={{ color: 'var(--text-main)' }}>
              {t('nav.artisans')}
            </Link>
            <Link to="/impact" style={{ color: 'var(--text-main)' }}>
              {t('nav.impact')}
            </Link>
            <Link to="/about" style={{ color: 'var(--text-main)' }}>
              {t('nav.about')}
            </Link>
            <Link to="/support" style={{ color: 'var(--text-main)' }}>
              {t('nav.support')}
            </Link>

            {/* Direct Portal links */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
              <Link
                to="/artisan/login"
                style={{ color: 'var(--color-terracotta)', fontWeight: '600' }}
              >
                🧵 {t('nav.artisanPortal')}
              </Link>
              <Link
                to="/admin/login"
                style={{ color: 'var(--color-indigo)', fontWeight: '600' }}
              >
                🛡️ {t('nav.adminPortal')}
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
