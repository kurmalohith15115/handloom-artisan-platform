import React from 'react';

export const RatingStars = ({ rating = 5, totalReviews = null, size = 16, interactive = false, onRate = null }) => {
  const rounded = Math.round(Number(rating) || 5);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            color: star <= rounded ? '#eab308' : '#d1d5db',
            fontSize: `${size}px`,
            lineHeight: 1,
            userSelect: 'none',
          }}
          title={`${star} stars`}
        >
          ★
        </span>
      ))}
      {rating !== undefined && (
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#4b5563', marginLeft: '4px' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
      {totalReviews !== null && (
        <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>({totalReviews})</span>
      )}
    </div>
  );
};
