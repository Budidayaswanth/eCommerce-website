import React from 'react';
import { RiCheckLine } from 'react-icons/ri';

const ColorSwatch = ({
  colorName,
  hexCode,
  secondaryHex = null,
  isSelected = false,
  onClick,
  size = 36,
  showLabel = false,
}) => {
  const backgroundStyle = secondaryHex
    ? `linear-gradient(135deg, ${hexCode} 50%, ${secondaryHex} 50%)`
    : hexCode;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
      }}
      onClick={onClick}
      title={secondaryHex ? `${colorName} (Mixed Dual Tint)` : colorName}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: backgroundStyle,
          border: isSelected ? '3px solid var(--color-primary)' : '2px solid rgba(0,0,0,0.15)',
          boxShadow: isSelected ? '0 0 0 2px var(--color-secondary)' : '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        }}
        className="color-swatch-circle"
      >
        {isSelected && (
          <RiCheckLine
            size={size * 0.55}
            style={{
              color: hexCode.toLowerCase() === '#ffffff' || hexCode.toLowerCase() === '#eceff1' ? '#1A237E' : '#FFFFFF',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
            }}
          />
        )}
      </div>

      {showLabel && (
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: isSelected ? '600' : '500',
            color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            textAlign: 'center',
            maxWidth: `${size * 1.8}px`,
            lineHeight: 1.2,
          }}
        >
          {colorName}
        </span>
      )}

      <style>{`
        .color-swatch-circle:hover {
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
};

export default ColorSwatch;
