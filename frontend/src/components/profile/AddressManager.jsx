import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { validateRequired, validatePincode, validatePhone } from '../../utils/validators';
import { RiMapPinLine, RiAddLine, RiDeleteBinLine, RiCheckLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('');
  const [errors, setErrors] = useState({});

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = {};

    const nameErr = validateRequired(name, 'Recipient Name');
    if (nameErr) newErrors.name = nameErr;

    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const streetErr = validateRequired(street, 'Street address');
    if (streetErr) newErrors.street = streetErr;

    const cityErr = validateRequired(city, 'City');
    if (cityErr) newErrors.city = cityErr;

    const pinErr = validatePincode(pincode);
    if (pinErr) newErrors.pincode = pinErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newAddr = {
      id: `addr-${Date.now()}`,
      name,
      phone,
      street,
      city,
      state,
      pincode,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    setShowAddForm(false);
    setName('');
    setPhone('');
    setStreet('');
    setCity('');
    setPincode('');
    setErrors({});
    toast.success('Address saved successfully');
  };

  const handleSetDefault = (id) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success('Default address updated');
  };

  const handleDelete = (id) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.success('Address removed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
          Saved Delivery Addresses
        </h3>
        {!showAddForm && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddForm(true)}
            icon={<RiAddLine />}
          >
            Add New Address
          </Button>
        )}
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSave}
          style={{
            backgroundColor: 'var(--color-bg-page)',
            padding: '20px',
            borderRadius: 'var(--radius-card)',
            border: '1.5px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>
            Enter New Delivery Address
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Recipient Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="e.g. Yaswanth Kumar"
              required
            />
            <Input
              label="Mobile Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              placeholder="10-digit number"
              required
            />
          </div>

          <Input
            label="Street Address / Building / Flat"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            error={errors.street}
            placeholder="Plot 402, Banjara Hills"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <Input
              label="City"
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
              placeholder="State"
              required
            />
            <Input
              label="PIN Code"
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              error={errors.pincode}
              placeholder="6 digits"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' }}>
            <Button variant="outline" size="md" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Delivery Address
            </Button>
          </div>
        </form>
      )}

      {/* Address cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {addresses.map((addr) => (
          <div
            key={addr.id}
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-card)',
              border: addr.isDefault ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: addr.isDefault ? '#FAFAFF' : '#FFFFFF',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>{addr.name}</span>
                {addr.isDefault && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: '700',
                      backgroundColor: 'var(--color-primary-subtle)',
                      color: 'var(--color-primary)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    DEFAULT
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {addr.street}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                📞 +91 {addr.phone}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              {!addr.isDefault ? (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600' }}
                >
                  Set as Default
                </button>
              ) : <div />}

              <button
                onClick={() => handleDelete(addr.id)}
                style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                aria-label="Delete address"
              >
                <RiDeleteBinLine size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressManager;
