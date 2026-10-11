import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-indigo)',
        color: '#ffffff',
        padding: '3.5rem 0 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container-wide">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🧵</span>
              <span className="heading-serif" style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                Handloom Artisan
              </span>
            </div>
            <p
              style={{
                fontSize: '0.88rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
              }}
            >
              A sustainable, direct-to-artisan marketplace created to preserve India's living handloom
              traditions and empower generational weaving communities across Telangana, Andhra Pradesh,
              and beyond.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <span>🇮🇳</span>
              <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: '500' }}>
                GI Registered Handicrafts & Handlooms
              </span>
            </div>
          </div>

          {/* Heritage Collections */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-saffron)',
                marginBottom: '1rem',
              }}
            >
              Craft Traditions
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
              <li><Link to="/products?category=pochampally-ikat">Pochampally Ikat Weaves</Link></li>
              <li><Link to="/products?category=kalamkari-art-handloom">Srikalahasti Kalamkari</Link></li>
              <li><Link to="/products?category=mangalagiri-cotton-silk">Mangalagiri Pit-Loom Cottons</Link></li>
              <li><Link to="/products?category=gadwal-handwoven-sarees">Gadwal Kuttu Silk Sarees</Link></li>
              <li><Link to="/products?category=bidriware-handicraft">Bidriware Metal Inlay Art</Link></li>
              <li><Link to="/categories">Browse All Craft Clusters →</Link></li>
            </ul>
          </div>

          {/* Quick Links & Service */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-saffron)',
                marginBottom: '1rem',
              }}
            >
              Customer & Track
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
              <li><Link to="/products">All Handloom Weaves</Link></li>
              <li><Link to="/artisans">Artisan Directory</Link></li>
              <li><Link to="/order-tracking">Track Order by Number</Link></li>
              <li><Link to="/impact">Community Impact Report</Link></li>
              <li><Link to="/about">About Our Heritage Mission</Link></li>
              <li><Link to="/support">Help & Support Desk</Link></li>
            </ul>
          </div>

          {/* Artisans & Governance */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-saffron)',
                marginBottom: '1rem',
              }}
            >
              Portals & Governance
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
              <li>
                <Link to="/artisan/register" style={{ color: '#fed7aa', fontWeight: '600' }}>
                  🧵 Join as an Artisan Weaver
                </Link>
              </li>
              <li><Link to="/artisan/login">Artisan Partner Login</Link></li>
              <li><Link to="/admin/login">Administrator Console</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
              <li><Link to="/shipping-refund-policy">Shipping & Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: '#94a3b8',
          }}
        >
          <div>
            © {new Date().getFullYear()} Handloom Artisan Support Platform. Handcrafted with pride in India.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Language:</span>
            <button
              onClick={() => setLanguage('en')}
              style={{
                background: 'none',
                border: 'none',
                color: language === 'en' ? '#ffffff' : '#94a3b8',
                fontWeight: language === 'en' ? '700' : '400',
                cursor: 'pointer',
              }}
            >
              English
            </button>
            <span>•</span>
            <button
              onClick={() => setLanguage('te')}
              style={{
                background: 'none',
                border: 'none',
                color: language === 'te' ? '#ffffff' : '#94a3b8',
                fontWeight: language === 'te' ? '700' : '400',
                cursor: 'pointer',
              }}
            >
              తెలుగు (Telugu)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
