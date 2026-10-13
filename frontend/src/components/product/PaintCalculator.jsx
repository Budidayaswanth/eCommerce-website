import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatPrice } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { RiCalculatorLine, RiInformationLine, RiCheckboxCircleLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const PaintCalculator = ({ isOpen, onClose, product, isInline = false }) => {
  const { addToCart } = useCart();

  const [length, setLength] = useState('14');
  const [width, setWidth] = useState('12');
  const [height, setHeight] = useState('10');
  const [doors, setDoors] = useState('1');
  const [windows, setWindows] = useState('2');
  const [coats, setCoats] = useState('2');

  // Area calculation
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  const d = parseInt(doors) || 0;
  const win = parseInt(windows) || 0;
  const c = parseInt(coats) || 2;

  // Total Wall Surface: 2 * (L + W) * H
  const grossArea = 2 * (l + w) * h;
  // Deductions: Doors ~ 21 sq.ft, Windows ~ 15 sq.ft
  const deductions = d * 21 + win * 15;
  const netWallArea = Math.max(0, grossArea - deductions);

  // Coverage: typical emulsion provides ~130 sq.ft per liter for 1 coat, so ~65 sq.ft for 2 coats
  const coveragePerLiterSingleCoat = 130;
  const requiredLiters = Math.max(1, Math.ceil((netWallArea * c) / coveragePerLiterSingleCoat));

  // Determine can configuration: e.g. 10L, 4L, 1L
  const tenLiters = Math.floor(requiredLiters / 10);
  const remainingAfterTen = requiredLiters % 10;
  const fourLiters = Math.floor(remainingAfterTen / 4);
  const oneLiters = remainingAfterTen % 4;

  const unitPricePerLiter = product?.price ? Math.round(product.price / 4) : 125;
  const estimatedCost = requiredLiters * unitPricePerLiter;

  const handleAddToCartCalculated = () => {
    if (product) {
      addToCart(product, Math.max(1, Math.ceil(requiredLiters / 4)), '4 Litres', product.finish || 'Matte');
      toast.success(`Added ${requiredLiters}L equivalent of ${product.name} to cart!`);
      if (onClose) onClose();
    } else {
      toast.success(`Calculated requirement: ${requiredLiters} Litres saved`);
      if (onClose) onClose();
    }
  };

  const calculatorContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Input Dimensions Grid */}
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
          Room Dimensions (Feet)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <Input
            label="Length (ft)"
            type="number"
            min="1"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          />
          <Input
            label="Width (ft)"
            type="number"
            min="1"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
          <Input
            label="Height (ft)"
            type="number"
            min="1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
      </div>

      {/* Openings & Coats */}
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
          Deductions & Number of Coats
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <Input
            label="Doors (Count)"
            type="number"
            min="0"
            value={doors}
            onChange={(e) => setDoors(e.target.value)}
          />
          <Input
            label="Windows (Count)"
            type="number"
            min="0"
            value={windows}
            onChange={(e) => setWindows(e.target.value)}
          />
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
              Coats
            </label>
            <select
              value={coats}
              onChange={(e) => setCoats(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 12px',
                borderRadius: 'var(--radius-btn)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontWeight: '500',
              }}
            >
              <option value="1">1 Coat (Touchup)</option>
              <option value="2">2 Coats (Recommended)</option>
              <option value="3">3 Coats (Fresh Plaster)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calculation Output Box */}
      <div
        style={{
          backgroundColor: 'var(--color-primary-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: '18px 20px',
          border: '1.5px solid #C5CAE9',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Paintable Area
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>
              {Math.round(netWallArea)} sq.ft
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Required Paint
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-primary)' }}>
              {requiredLiters} Litres
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Est. Material Cost
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-accent)' }}>
              {formatPrice(estimatedCost)}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid #C5CAE9',
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RiCheckboxCircleLine color="var(--color-success)" size={16} />
          <span>
            Recommended Can Bundle: {tenLiters > 0 && `${tenLiters}x 10L `}
            {fourLiters > 0 && `${fourLiters}x 4L `}
            {oneLiters > 0 && `${oneLiters}x 1L`}
          </span>
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        size="lg"
        onClick={handleAddToCartCalculated}
        icon={<RiCalculatorLine />}
      >
        Add Calculated Quantity to Cart
      </Button>
    </div>
  );

  if (isInline) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <RiCalculatorLine color="var(--color-primary)" /> Paint Quantity & Cost Estimator
        </h3>
        {calculatorContent}
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Precision Paint Coverage Calculator"
      maxWidth="540px"
    >
      {calculatorContent}
    </Modal>
  );
};

export default PaintCalculator;
