import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import addressService from '../../services/addressService';
import { formatPrice } from '../../utils/formatters';
import { validateRequired, validatePincode, validatePhone } from '../../utils/validators';
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
  RiCrosshairLine,
  RiAddLine,
  RiCheckLine,
  RiHome4Line,
  RiBuildingLine,
  RiCompass3Line,
} from 'react-icons/ri';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'Instant UPI (Google Pay, PhonePe, BHIM)', icon: RiQrCodeLine },
  { id: 'ONLINE_CARD', label: 'Credit / Debit Cards (Visa, Mastercard, RuPay)', icon: RiBankCardLine },
  { id: 'NET_BANKING', label: 'Net Banking (All Major Indian Banks)', icon: RiMoneyDollarCircleLine },
  { id: 'COD', label: 'Cash On Delivery (Available for paint orders)', icon: RiTruckLine },
];

const CheckoutPage = () => {
  const { items, totalAmount, appliedCoupon, couponDiscount, deliveryCharge, finalAmount, clearCart } = useCart();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const navigate = useNavigate();

  // Address state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressMode, setAddressMode] = useState('SAVED'); // 'SAVED' or 'NEW'

  // New address form state
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    landmark: '',
    city: '',
    state: 'Telangana',
    pincode: '',
    latitude: null,
    longitude: null,
    saveForFuture: true,
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [addressErrors, setAddressErrors] = useState({});

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  // Load saved addresses for authenticated user
  useEffect(() => {
    let isCurrent = true;
    const fetchUserAddresses = async () => {
      if (!isAuthenticated) {
        setLoadingAddresses(false);
        setAddressMode('NEW');
        return;
      }

      setLoadingAddresses(true);
      try {
        const list = await addressService.getAddresses();
        if (isCurrent) {
          setSavedAddresses(list);
          if (list.length > 0) {
            const defaultAddr = list.find((a) => a.isDefault) || list[0];
            setSelectedAddressId(defaultAddr.id);
            setAddressMode('SAVED');
          } else {
            setAddressMode('NEW');
          }
        }
      } catch {
        if (isCurrent) setAddressMode('NEW');
      } finally {
        if (isCurrent) setLoadingAddresses(false);
      }
    };

    fetchUserAddresses();

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated]);

  // Current Location detection for Checkout
  const handleDetectCurrentLocation = async () => {
    setDetectingLocation(true);
    try {
      const coords = await addressService.getCurrentCoordinates();
      setNewAddress((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));

      toast.loading('Resolving address from GPS coordinates...', { id: 'geo-checkout' });
      const geo = await addressService.reverseGeocode(coords.latitude, coords.longitude);
      toast.dismiss('geo-checkout');

      setNewAddress((prev) => ({
        ...prev,
        street: geo.street || prev.street,
        city: geo.city || prev.city,
        state: geo.state || prev.state,
        pincode: geo.pincode || prev.pincode,
        landmark: geo.landmark || prev.landmark,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));

      toast.success(geo.city ? `Delivery location set: ${geo.city} (${geo.pincode})` : 'GPS coordinates captured!');
    } catch (err) {
      toast.dismiss('geo-checkout');
      toast.error(err.message || 'Could not detect current location');
    } finally {
      setDetectingLocation(false);
    }
  };

  const validateNewAddress = () => {
    const errs = {};
    const nameErr = validateRequired(newAddress.name, 'Recipient Name');
    if (nameErr) errs.name = nameErr;

    const phoneErr = validatePhone(newAddress.phone);
    if (phoneErr) errs.phone = phoneErr;

    const streetErr = validateRequired(newAddress.street, 'Street address');
    if (streetErr) errs.street = streetErr;

    const cityErr = validateRequired(newAddress.city, 'City');
    if (cityErr) errs.city = cityErr;

    const pinErr = validatePincode(newAddress.pincode);
    if (pinErr) errs.pincode = pinErr;

    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  if (items.length === 0) {
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast('Please verify your mobile number or log in to confirm paint order dispatch', { icon: '🔐' });
      openLoginModal();
      return;
    }

    setLoading(true);

    try {
      let finalAddressId = selectedAddressId;

      // If user is adding a new address or using GPS location
      if (addressMode === 'NEW' || !finalAddressId) {
        if (!validateNewAddress()) {
          setLoading(false);
          toast.error('Please complete all required delivery address fields');
          return;
        }

        const savedAddr = await addressService.addAddress({
          label: newAddress.label || 'Home',
          receiverName: newAddress.name,
          receiverPhone: newAddress.phone,
          fullAddress: newAddress.street,
          landmark: newAddress.landmark,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          latitude: newAddress.latitude,
          longitude: newAddress.longitude,
          isDefault: !!newAddress.saveForFuture,
        });

        finalAddressId = savedAddr.id;
        setSavedAddresses((prev) => [savedAddr, ...prev]);
        setSelectedAddressId(savedAddr.id);
      }

      const orderPayload = {
        addressId: finalAddressId,
        couponCode: appliedCoupon?.code || undefined,
        notes: `Payment Method: ${paymentMethod}${appliedCoupon ? ` | Coupon Applied: ${appliedCoupon.code}` : ''}`,
        paymentMethod,
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
      };

      const createdOrder = await orderService.createOrder(orderPayload);

      // Create & Verify payment session
      const session = await paymentService.createPaymentSession({
        orderId: createdOrder.id,
        amount: finalAmount,
      });

      await paymentService.verifyPayment({
        orderId: createdOrder.id,
        paymentMethod,
        cfOrderId: session?.cfOrderId,
      });

      await clearCart();
      toast.success('Order placed successfully! Tamper-proof dispatch scheduled.');
      navigate(`/payment/status?orderId=${createdOrder.id}&status=success`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please check address details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', margin: 0, fontWeight: '800' }}>
          Checkout & Order Confirmation
        </h1>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          Direct factory dispatch with computerized spectral shade lock and tamper-proof container security.
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
          {/* Section 1: Address Selection / Location Detection */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RiMapPinLine size={22} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
                  1. Delivery Destination Address
                </h3>
              </div>

              {/* Mode switch or Location Button */}
              {savedAddresses.length > 0 && addressMode === 'SAVED' && (
                <button
                  type="button"
                  onClick={() => setAddressMode('NEW')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RiAddLine size={16} /> Deliver to New Address / Use GPS
                </button>
              )}

              {addressMode === 'NEW' && savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAddressMode('SAVED')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  ← Select from Saved Addresses ({savedAddresses.length})
                </button>
              )}
            </div>

            {/* Mode 1: Select from Saved Addresses */}
            {addressMode === 'SAVED' && savedAddresses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-card)',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-primary-subtle)' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="radio"
                        name="selected-address"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(addr.id)}
                        style={{ marginTop: '4px', accentColor: 'var(--color-primary)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                            {addr.receiverName || addr.name || user?.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                              color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {addr.label || 'Home'}
                          </span>
                          {addr.isDefault && (
                            <span style={{ fontSize: '0.6875rem', color: '#16A34A', fontWeight: '700' }}>
                              ● DEFAULT
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                          {addr.fullAddress || addr.street}
                          {addr.landmark ? `, Landmark: ${addr.landmark}` : ''}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                          {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          📞 +91 {addr.receiverPhone || addr.phone || user?.phone}
                        </div>

                        {addr.latitude && addr.longitude && (
                          <div style={{ fontSize: '0.6875rem', color: '#059669', fontWeight: '600', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <RiCrosshairLine size={12} /> GPS Verified Destination
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Mode 2: Enter New Address with GPS auto-detection */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Use Current Location Banner Button */}
                <div
                  style={{
                    backgroundColor: 'var(--color-primary-subtle)',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-card)',
                    border: '1.5px dashed var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                      }}
                    >
                      <RiCrosshairLine size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--color-primary-dark)' }}>
                        Deliver to Current Location?
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        Auto-fill address, city, state, and pin code using device GPS
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDetectCurrentLocation}
                    isLoading={detectingLocation}
                    icon={<RiCrosshairLine />}
                  >
                    Use Current Location
                  </Button>
                </div>

                {/* GPS Tagged Banner */}
                {newAddress.latitude && newAddress.longitude && (
                  <div
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ECFDF5',
                      borderRadius: '8px',
                      border: '1px solid #A7F3D0',
                      fontSize: '0.75rem',
                      color: '#065F46',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <RiCheckLine size={16} /> GPS Location Tagged: {newAddress.latitude.toFixed(4)}° N, {newAddress.longitude.toFixed(4)}° E
                  </div>
                )}

                {/* Recipient Name & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Input
                    label="Recipient Full Name"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    error={addressErrors.name}
                    placeholder="e.g. Yaswanth Budida"
                    required
                  />
                  <Input
                    label="Delivery Phone Number"
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    error={addressErrors.phone}
                    placeholder="10-digit number"
                    required
                  />
                </div>

                {/* Street Address */}
                <Input
                  label="Street Address / House / Flat / Site Location"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  error={addressErrors.street}
                  placeholder="Plot 402, Banjara Hills Road No 36"
                  required
                />

                {/* Landmark */}
                <Input
                  label="Landmark (Optional)"
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                  placeholder="e.g. Opposite Metro Pillar 1210"
                />

                {/* City, State, PIN code */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <Input
                    label="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    error={addressErrors.city}
                    placeholder="Hyderabad"
                    required
                  />
                  <Input
                    label="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    placeholder="Telangana"
                    required
                  />
                  <Input
                    label="PIN Code"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    error={addressErrors.pincode}
                    placeholder="6 digits (500034)"
                    required
                  />
                </div>

                {/* Save address checkbox */}
                {isAuthenticated && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', cursor: 'pointer', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      checked={newAddress.saveForFuture}
                      onChange={(e) => setNewAddress({ ...newAddress, saveForFuture: e.target.checked })}
                    />
                    Save this address to my account for future paint orders
                  </label>
                )}
              </div>
            )}
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
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
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
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
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
