import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { RatingStars } from '../components/RatingStars';

export const ArtisanProfilePage = () => {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/artisans/profile/${id}`);
        if (res.success) {
          setArtisan(res.artisan);
          setProducts(res.products || []);
        }
      } catch (err) {
        console.error('Error fetching artisan profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="page-wrapper container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 className="heading-serif">Artisan Profile Not Found</h2>
        <Link to="/artisans" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Artisan Directory
        </Link>
      </div>
    );
  }

  const name = artisan.user?.name || 'Master Artisan';
  const photo =
    artisan.profilePhoto ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Profile Banner */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            marginBottom: '3rem',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <img
            src={photo}
            alt={name}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid var(--color-terracotta)',
              boxShadow: '0 8px 16px rgba(163, 62, 38, 0.2)',
              marginBottom: '1rem',
            }}
          />

          <h1 className="heading-serif" style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>
            {name}
          </h1>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge badge-terracotta" style={{ fontSize: '0.85rem' }}>
              {artisan.craftType}
            </span>
            <span className="badge badge-forest">
              📍 {artisan.location?.village}, {artisan.location?.state}
            </span>
            <span className="badge badge-saffron">
              {artisan.experienceYears}+ Years Craft Mastery
            </span>
          </div>

          <RatingStars rating={artisan.rating || 5} totalReviews={artisan.totalReviews} size={18} />

          {/* Craft Heritage Story */}
          <div
            style={{
              maxWidth: '750px',
              margin: '2rem auto 0',
              padding: '1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              textAlign: 'left',
            }}
          >
            <h3 className="heading-serif" style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-indigo)' }}>
              Heritage Craft Story & Technique
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.96rem' }}>
              {artisan.craftStory}
            </p>
          </div>
        </div>

        {/* Products by this Artisan */}
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h2 className="heading-serif" style={{ fontSize: '1.8rem', color: 'var(--color-indigo)' }}>
              Handloom Weaves by {name} ({products.length})
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Every item ordered from this studio directly funds this artisan family.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid-products">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                This artisan currently has no products listed for immediate delivery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
