import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ maxWidth: '680px', margin: '0 auto 3rem', textAlign: 'center' }}>
          <span className="badge badge-saffron" style={{ marginBottom: '0.5rem' }}>
            GI Certified Regional Traditions
          </span>
          <h1 className="heading-serif" style={{ fontSize: '2.5rem', color: 'var(--color-indigo)', marginBottom: '0.75rem' }}>
            Traditional Indian Craft Clusters
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Explore distinctive weaving techniques, natural dye art, and handicrafts perfected over
            centuries across Indian craft regions.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {cat.craftType && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        backgroundColor: 'rgba(26, 43, 73, 0.9)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                      }}
                    >
                      {cat.craftType}
                    </span>
                  )}
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 className="heading-serif" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
                    {cat.name}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {cat.description}
                  </p>
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="btn btn-primary"
                    style={{ marginTop: 'auto', width: '100%' }}
                  >
                    Explore {cat.name} Weaves →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
