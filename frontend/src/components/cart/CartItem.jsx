import React from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import { formatPrice } from '../../utils/formatters';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, size, finish, quantity, price, id } = item;

  return (
    <div
      style={{
        display: 'flex',
        gap: '14px',
        padding: '14px 0',
        borderBottom: '1px solid var(--color-border)',
        alignItems: 'center',
      }}
    >
      {/* Product Thumbnail */}
      <img
        src={product.image}
        alt={product.name}
        style={{
          width: '74px',
          height: '74px',
          borderRadius: '8px',
          objectFit: 'cover',
          border: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      />

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            margin: '0 0 4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={product.name}
        >
          {product.name}
        </h4>

        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
          {size} • {finish}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Quantity Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              height: '30px',
              backgroundColor: 'var(--color-bg-page)',
            }}
          >
            <button
              onClick={() => onUpdateQuantity(id, quantity - 1)}
              style={{ padding: '0 8px', fontSize: '1rem', fontWeight: 'bold' }}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '0.8125rem', fontWeight: '600' }}>
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(id, quantity + 1)}
              style={{ padding: '0 8px', fontSize: '1rem', fontWeight: 'bold' }}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--color-primary)' }}>
              {formatPrice(price * quantity)}
            </span>
          </div>

          {/* Remove */}
          <button
            onClick={() => onRemove(id)}
            style={{
              color: 'var(--color-text-muted)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
            className="cart-trash-btn"
            aria-label="Remove item"
          >
            <RiDeleteBinLine size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .cart-trash-btn:hover {
          color: var(--color-accent) !important;
        }
      `}</style>
    </div>
  );
};

export default CartItem;
