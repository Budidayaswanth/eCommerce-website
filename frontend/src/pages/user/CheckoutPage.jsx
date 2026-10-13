import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import { formatPrice } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Footer from '../../components/layout/Footer';
import {
  RiShieldCheckLine,
  RiBankCardLine,
  RiQrCodeLine,
  RiMoneyDollarCircleLine,
  RiTruckLine,
  RiMapPinLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'Instant UPI (Google Pay, PhonePe, BHIM)', icon: RiQrCodeLine },
  { id: 'ONLINE_CARD', label: 'Credit / Debit Cards (Visa, Mastercard, RuPay)', icon: RiBankCardLine },
  { id: 'NET_BANKING', label: 'Net Banking (All Major Indian Banks)', icon: RiMoneyDollarCircleLine },
  { id: 'COD', label: 'Cash On Delivery (Available for paint orders)', icon: RiTruckLine },
];

const CheckoutPage = () => {
  const { items, totalAmount, couponDiscount, deliveryCharge, finalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: user?.name || 'Yaswanth Kumar',
    phone: user?.phone || '9876543210',
    street: 'Flat 402, Royal Palms, Road No. 12, Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          name: i.product.name,
          productId: i.product.id,
          size: i.size,
          finish: i.finish,
          quantity: i.quantity,
          price: i.price,
          image: i.product.image,
        })),
        totalAmount: finalAmount,
        shippingAddress: address,
        paymentMethod,
      };

      const createdOrder = await orderService.createOrder(orderPayload);

      // Create & Verify payment session
      await paymentService.createPaymentSession({
        orderId: createdOrder.id,
        amount: finalAmount,
      });

      await paymentService.verifyPayment({
        orderId: createdOrder.id,
        paymentMethod,
      });

      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/payment/status?orderId=${createdOrder.id}&status=success`);
    } catch {
      toast.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', margin: 0 }}>
          Checkout & Order Confirmation
        </h1>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          Direct factory dispatch with tamper-proof container security.
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '32px',
          alignItems: 'flex-start',
        }}
        className="checkout-layout"
      >
        {/* Left Column: Delivery Address & Payment Method */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Address */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <RiMapPinLine size={22} color="var(--color-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
                1. Delivery Destination Address
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Full Name"
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                required
              />
            </div>

            <div style={{ marginTop: '14px' }}>
              <Input
                label="Street Address / Building"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '14px' }}>
              <Input
                label="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                required
              />
              <Input
                label="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                required
              />
              <Input
                label="PIN Code"
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <RiShieldCheckLine size={22} color="var(--color-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
                2. Select Payment Mode
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <label
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-btn)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-primary-subtle)' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment-mode"
                      checked={isSelected}
                      onChange={() => setPaymentMethod(pm.id)}
                    />
                    <Icon size={22} color={isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
                    <span style={{ fontWeight: isSelected ? '700' : '500', fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                      {pm.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Review & Place Order */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
            Order Summary Review
          </h3>

          {/* Mini Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--color-text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {it.quantity}x {it.product.name} ({it.size})
                </span>
                <span style={{ fontWeight: '600' }}>{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Item Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            {couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                <span>Coupon Discount</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Shipping Charges</span>
              <span>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
            </div>
            <div
              style={{
                borderTop: '1.5px solid var(--color-border)',
                paddingTop: '12px',
                marginTop: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: '800',
                color: 'var(--color-primary)',
              }}
            >
              <span>Amount Payable</span>
              <span>{formatPrice(finalAmount)}</span>
            </div>
          </div>

          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handlePlaceOrder}
            isLoading={loading}
          >
            Pay {formatPrice(finalAmount)} & Place Order
          </Button>

          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <RiShieldCheckLine size={16} /> 256-Bit SSL Secured Payment
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .checkout-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
