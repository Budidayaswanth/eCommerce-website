import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { validateRequired, validatePincode, validatePhone } from '../../utils/validators';
import {
  RiMapPinLine,
  RiAddLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCrosshairLine,
  RiEditLine,
  RiBuildingLine,
  RiHome4Line,
  RiCompass3Line,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import addressService from '../../services/addressService';

const ADDRESS_TYPES = [
  { id: 'Home', label: 'Home', icon: RiHome4Line },
  { id: 'Office', label: 'Office / Commercial', icon: RiBuildingLine },
  { id: 'Site', label: 'Site / Painting Project', icon: RiCompass3Line },
];

const AddressManager = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [label, setLabel] = useState('Home');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch {
      toast.error('Unable to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setLabel('Home');
    setReceiverName(user?.name || '');
    setReceiverPhone(user?.phone || '');
    setFullAddress('');
    setLandmark('');
    setCity('');
    setState('Telangana');
    setPincode('');
    setLatitude(null);
    setLongitude(null);
    setIsDefault(addresses.length === 0);
    setErrors({});
    setShowForm(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setReceiverName(user?.name || '');
    setReceiverPhone(user?.phone || '');
    setIsDefault(addresses.length === 0);
    setShowForm(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr.id);
    setLabel(addr.label || 'Home');
    setReceiverName(addr.receiverName || addr.name || '');
    setReceiverPhone(addr.receiverPhone || addr.phone || '');
    setFullAddress(addr.fullAddress || addr.street || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || '');
    setState(addr.state || 'Telangana');
    setPincode(addr.pincode || '');
    setLatitude(addr.latitude || null);
    setLongitude(addr.longitude || null);
    setIsDefault(!!addr.isDefault);
    setErrors({});
    setShowForm(true);
  };

  // Detect Current Location using Geolocation API + Reverse Geocoding
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const coords = await addressService.getCurrentCoordinates();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);

      toast.loading('Resolving address from GPS...', { id: 'geo-toast' });
      const geoData = await addressService.reverseGeocode(coords.latitude, coords.longitude);
      toast.dismiss('geo-toast');

      if (geoData.street && !fullAddress) {
        setFullAddress(geoData.street);
      }
      if (geoData.city) setCity(geoData.city);
      if (geoData.state) setState(geoData.state);
      if (geoData.pincode) setPincode(geoData.pincode);
      if (geoData.landmark) setLandmark(geoData.landmark);

      toast.success(
        geoData.city
          ? `Location found: ${geoData.city} (${geoData.pincode || 'GPS Tagged'})`
          : 'GPS location coordinates captured!'
      );
    } catch (err) {
      toast.dismiss('geo-toast');
      toast.error(err.message || 'Failed to detect current location');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const nameErr = validateRequired(receiverName, 'Recipient Name');
    if (nameErr) newErrors.receiverName = nameErr;

    const phoneErr = validatePhone(receiverPhone);
    if (phoneErr) newErrors.receiverPhone = phoneErr;

    const addrErr = validateRequired(fullAddress, 'Street address');
    if (addrErr) newErrors.fullAddress = addrErr;

    const cityErr = validateRequired(city, 'City');
    if (cityErr) newErrors.city = cityErr;

    const pinErr = validatePincode(pincode);
    if (pinErr) newErrors.pincode = pinErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      label,
      receiverName,
      receiverPhone,
      fullAddress,
      landmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault,
    };

    try {
      if (editingId) {
        const updated = await addressService.updateAddress(editingId, payload);
        toast.success('Address updated successfully');
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingId ? updated : payload.isDefault ? { ...a, isDefault: false } : a))
        );
      } else {
        const saved = await addressService.addAddress(payload);
        toast.success('New address added to your address book');
        if (payload.isDefault) {
          setAddresses((prev) => [saved, ...prev.map((a) => ({ ...a, isDefault: false }))]);
        } else {
          setAddresses((prev) => [...prev, saved]);
        }
      }
      resetForm();
    } catch {
      toast.error('Failed to save address. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      toast.success('Default delivery address updated');
    } catch {
      toast.error('Failed to set default address');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery address?')) {
      return;
    }

    try {
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address removed from address book');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
            Saved Delivery Addresses & Sites
          </h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Manage delivery destinations for bulk architectural and residential paint dispatches
          </span>
        </div>

        {!showForm && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<RiAddLine size={18} />}
          >
            Add New Address
          </Button>
        )}
      </div>

      {/* Add / Edit Address Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: 'var(--radius-card)',
            border: '2px solid var(--color-primary-subtle)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
              {editingId ? 'Edit Delivery Destination' : 'Add New Delivery Address'}
            </div>

            {/* Current Location Trigger Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-btn)',
                border: '1.5px solid var(--color-primary)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary-dark)',
                fontSize: '0.8125rem',
                fontWeight: '600',
                cursor: detectingLocation ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <RiCrosshairLine size={18} color="var(--color-primary)" />
              {detectingLocation ? 'Detecting GPS Coordinates...' : 'Use Current Location'}
            </button>
          </div>

          {/* GPS Coordinates Badge if detected */}
          {latitude && longitude && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#ECFDF5',
                borderRadius: '8px',
                border: '1px solid #A7F3D0',
                fontSize: '0.75rem',
                color: '#065F46',
                fontWeight: '600',
              }}
            >
              <RiMapPinLine size={16} />
              <span>
                GPS Verified: {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E (Pin Drop Saved)
              </span>
            </div>
          )}

          {/* Address Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
              Address Category
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {ADDRESS_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = label === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setLabel(t.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-primary)' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--color-text-primary)',
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? '700' : '500',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={16} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <Input
              label="Contact / Recipient Name"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              error={errors.receiverName}
              placeholder="e.g. Yaswanth Budida"
              required
            />
            <Input
              label="Contact Phone Number"
              type="tel"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              error={errors.receiverPhone}
              placeholder="10-digit mobile number"
              required
            />
          </div>

          {/* Street Address */}
          <Input
            label="Street Address / Flat No / Building / Colony"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            error={errors.fullAddress}
            placeholder="Plot 402, Royal Residency, Road No. 36"
            required
          />

          {/* Landmark */}
          <Input
            label="Nearby Landmark (Optional)"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Opposite Metro Pillar 1210 / Behind Reliance Fresh"
          />

          {/* City, State, PIN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <Input
              label="City / Town"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
              placeholder="Hyderabad"
              required
            />
            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Telangana"
              required
            />
            <Input
              label="PIN Code"
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              error={errors.pincode}
              placeholder="6 digits (e.g. 500034)"
              required
            />
          </div>

          {/* Default address toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <span style={{ fontWeight: '500' }}>Make this my default destination for paint shipments</span>
          </label>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="outline" size="md" type="button" onClick={resetForm}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
              {editingId ? 'Save Changes' : 'Save Address'}
            </Button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading your delivery destinations...
        </div>
      ) : addresses.length === 0 && !showForm ? (
        /* Empty State */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '40px 24px',
            borderRadius: 'var(--radius-card)',
            border: '1px dashed var(--color-border)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <RiMapPinLine size={28} />
          </div>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
            No Saved Addresses Yet
          </h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '420px' }}>
            Add your residential or commercial painting site address for streamlined order dispatches and precise freight calculations.
          </p>
          <Button variant="primary" size="md" onClick={handleOpenAdd} icon={<RiAddLine />}>
            Add Delivery Address
          </Button>
        </div>
      ) : (
        /* Addresses Cards Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {addresses.map((addr) => (
            <div
              key={addr.id}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-card)',
                border: addr.isDefault ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: addr.isDefault ? '#FAFAFF' : '#FFFFFF',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-xs)',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div>
                {/* Card Header: Type Badge & Default Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-primary-subtle)',
                      color: 'var(--color-primary-dark)',
                    }}
                  >
                    {addr.label || 'Home'}
                  </span>

                  {addr.isDefault && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: '700',
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      <RiCheckLine size={12} /> DEFAULT
                    </span>
                  )}
                </div>

                {/* Recipient & Phone */}
                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  {addr.receiverName || addr.name || user?.name || 'Valued Customer'}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                  📞 +91 {addr.receiverPhone || addr.phone || user?.phone || 'Contact on file'}
                </div>

                {/* Address text */}
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                  {addr.fullAddress || addr.street}
                </div>

                {addr.landmark && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    <span style={{ fontWeight: '600' }}>Landmark:</span> {addr.landmark}
                  </div>
                )}

                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                </div>

                {/* GPS Verified Badge */}
                {addr.latitude && addr.longitude && (
                  <div
                    style={{
                      marginTop: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.6875rem',
                      color: '#059669',
                      fontWeight: '600',
                    }}
                  >
                    <RiCrosshairLine size={13} /> GPS Coordinates Tagged
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <div>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '0.75rem',
                        color: 'var(--color-primary)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    aria-label="Edit address"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <RiEditLine size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    aria-label="Delete address"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <RiDeleteBinLine size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
