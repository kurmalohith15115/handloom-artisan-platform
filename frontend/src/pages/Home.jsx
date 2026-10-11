import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ArtisanCard } from '../components/ArtisanCard';
import { useLanguage } from '../context/LanguageContext';

export const Home = () => {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredArtisans, setFeaturedArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes, artRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/categories'),
          api.get('/artisans'),
        ]);

        if (prodRes.success) setFeaturedProducts(prodRes.products || []);
        if (catRes.success) setCategories(catRes.categories || []);
        if (artRes.success) setFeaturedArtisans(artRes.artisans?.slice(0, 3) || []);
      } catch (err) {
        console.warn('Could not load initial homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          backgroundColor: 'var(--bg-secondary)',
          padding: '5rem 0 6rem',
          overflow: 'hidden',
          backgroundImage:
            'radial-gradient(var(--border-light) 1.5px, transparent 1.5px), radial-gradient(var(--border-light) 1.5px, var(--bg-secondary) 1.5px)',
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <span
              className="badge badge-terracotta"
              style={{ marginBottom: '1.25rem', fontSize: '0.85rem', padding: '0.35rem 0.9rem' }}
            >
              🇮🇳 {t('hero.badge')}
            </span>

            <h1
              className="heading-serif"
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                color: 'var(--color-indigo)',
                lineHeight: 1.15,
                marginBottom: '1.5rem',
              }}
            >
              {t('hero.title')}
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: '2.5rem',
              }}
            >
              {t('hero.subtitle')}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <Link to="/products" className="btn btn-primary btn-lg">
                🧵 {t('hero.exploreBtn')}
              </Link>
              <Link to="/artisan/register" className="btn btn-secondary btn-lg">
                🎨 {t('hero.artisanJoinBtn')}
              </Link>
            </div>

            {/* Quick Guarantees */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '2rem',
                marginTop: '3.5rem',
                fontSize: '0.88rem',
                color: 'var(--text-main)',
                fontWeight: '600',
              }}
            >
              <span>✓ 100% Direct Weaver Payout</span>
              <span>✓ Certified GI Heritage Weaves</span>
              <span>✓ Fair Trade & No Middlemen</span>
              <span>✓ Pan-India Secure Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Carousel / Grid */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span className="badge badge-saffron" style={{ marginBottom: '0.5rem' }}>
                Heritage Traditions
              </span>
              <h2 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--color-indigo)' }}>
                {t('sections.categoriesTitle')}
              </h2>
            </div>
            <Link to="/categories" className="btn btn-outline btn-sm">
              Explore All Craft Regions →
            </Link>
          </div>

          <div className="grid-categories">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                className="card"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  aspectRatio: '4/3',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.25rem',
                  color: '#ffffff',
                }}
              >
                <img
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={cat.name}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3
                    className="heading-serif"
                    style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.2rem' }}
                  >
                    {cat.name}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#fef08a', fontWeight: '500' }}>
                    {cat.craftType || 'Handwoven Heritage'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Masterpiece Products */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span className="badge badge-terracotta" style={{ marginBottom: '0.5rem' }}>
                Handcrafted Masterpieces
              </span>
              <h2 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--color-indigo)' }}>
                {t('sections.featuredTitle')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {t('sections.featuredSubtitle')}
              </p>
            </div>
            <Link to="/products" className="btn btn-primary">
              {t('sections.viewAll')} →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner" />
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{t('common.loading')}</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid-products">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div
              className="card"
              style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#ffffff' }}
            >
              <p style={{ color: 'var(--text-muted)' }}>
                Catalogue initialized. Visit "All Handlooms" or check back shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Meet the Artisans Spotlight */}
      {featuredArtisans.length > 0 && (
        <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
              <span className="badge badge-forest" style={{ marginBottom: '0.5rem' }}>
                Master Creators
              </span>
              <h2 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--color-indigo)' }}>
                {t('sections.artisanSpotlightTitle')}
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                {t('sections.artisanSpotlightSubtitle')}
              </p>
            </div>

            <div className="grid-artisans">
              {featuredArtisans.map((artisan) => (
                <ArtisanCard key={artisan._id} artisan={artisan} />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/artisans" className="btn btn-secondary">
                View All Master Artisans Directory →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Community Impact Three Pillars */}
      <section
        style={{
          padding: '5rem 0',
          backgroundColor: 'var(--color-indigo)',
          color: '#ffffff',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'var(--color-saffron)',
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Our Ethical Promise
            </span>
            <h2 className="heading-serif" style={{ fontSize: '2.3rem' }}>
              {t('sections.impactTitle')}
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
              <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>
                {t('sections.impactFairPay')}
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
                {t('sections.impactFairPayDesc')}
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏛️</div>
              <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>
                {t('sections.impactGiVerified')}
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
                {t('sections.impactGiVerifiedDesc')}
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👩‍🌾</div>
              <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>
                {t('sections.impactEmpowerment')}
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
                {t('sections.impactEmpowermentDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
