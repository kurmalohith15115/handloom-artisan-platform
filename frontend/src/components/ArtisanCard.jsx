import React from 'react';
import { Link } from 'react-router-dom';
import { RatingStars } from './RatingStars';

export const ArtisanCard = ({ artisan }) => {
  if (!artisan) return null;

  const photo =
    artisan.profilePhoto ||
    artisan.user?.avatar ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

  const name = artisan.user?.name || 'Master Artisan';
  const locationStr = [artisan.location?.village, artisan.location?.state]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1.25rem' }}>
        <img
          src={photo}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
            border: '3px solid var(--color-terracotta)',
            boxShadow: '0 4px 10px rgba(163, 62, 38, 0.2)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            backgroundColor: '#15803d',
            color: '#ffffff',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            border: '2px solid #ffffff',
          }}
          title="Verified Artisan"
        >
          ✓
        </span>
      </div>

      <h3 className="heading-serif" style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
        {name}
      </h3>

      <span
        style={{
          display: 'inline-block',
          fontSize: '0.82rem',
          fontWeight: '600',
          color: 'var(--color-terracotta)',
          marginBottom: '0.5rem',
        }}
      >
        {artisan.craftType}
      </span>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        📍 {locationStr || 'India'}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          margin: '0 auto 1.25rem',
        }}
      >
        <span className="badge badge-saffron" style={{ fontSize: '0.75rem' }}>
          {artisan.experienceYears}+ Yrs Experience
        </span>
        <RatingStars rating={artisan.rating || 5} totalReviews={artisan.totalReviews} size={12} />
      </div>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: '1.5rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          fontStyle: 'italic',
        }}
      >
        "{artisan.craftStory}"
      </p>

      <Link
        to={`/artisans/${artisan._id}`}
        className="btn btn-outline btn-sm"
        style={{ marginTop: 'auto', width: '100%' }}
      >
        View Craft Story & Weaves →
      </Link>
    </div>
  );
};
