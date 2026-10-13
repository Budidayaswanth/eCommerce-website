import React, { useState } from 'react';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';

const StarRating = ({
  rating = 0,
  maxStars = 5,
  size = 18,
  interactive = false,
  onChange,
  count,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = activeRating >= starValue;
          const isHalf = !isFilled && activeRating >= starValue - 0.5;

          return (
            <span
              key={index}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              style={{
                cursor: interactive ? 'pointer' : 'default',
                color: '#FFD700',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'transform var(--transition-fast)',
              }}
              className={interactive ? 'star-interactive' : ''}
              role={interactive ? 'button' : 'img'}
              aria-label={`${starValue} Star`}
            >
              {isFilled ? (
                <RiStarFill size={size} />
              ) : isHalf ? (
                <RiStarHalfFill size={size} />
              ) : (
                <RiStarLine size={size} style={{ color: '#D1D5DB' }} />
              )}
            </span>
          );
        })}
      </div>

      {count !== undefined && (
        <span
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
            fontWeight: '500',
            marginLeft: '4px',
          }}
        >
          ({count})
        </span>
      )}

      <style>{`
        .star-interactive:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default StarRating;
