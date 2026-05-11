import React from 'react';

function StarRating({ rating, onRatingChange, readonly = false, size = '24px' }) {
  const stars = [1, 2, 3, 4, 5];

  const getStarColor = (starValue, currentRating) => {
    if (readonly) {
      if (currentRating >= 5) return '#22c55e'; // green for 5 stars
      if (currentRating >= 4) return '#eab308'; // yellow for 4 stars
      if (currentRating >= 2) return '#eab308'; // yellow for 2-3 stars
      return '#ef4444'; // red for 1 star
    }
    return currentRating >= starValue ? '#fbbf24' : '#d1d5db';
  };

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onRatingChange(star)}
          style={{
            cursor: readonly ? 'default' : 'pointer',
            fontSize: size,
            color: getStarColor(star, rating),
            transition: 'color 0.2s ease, transform 0.1s ease',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            if (!readonly) {
              e.target.style.transform = 'scale(1.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!readonly) {
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default StarRating;
