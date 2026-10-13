import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import OrderHistory from './OrderHistory';
import AddressManager from './AddressManager';
import OtpPopup from '../auth/OtpPopup';
import Button from '../common/Button';
import Input from '../common/Input';
import { RiUser3Line, RiShieldKeyholeLine, RiEditLine, RiShoppingBag3Line, RiMapPinLine, RiStarLine } from 'react-icons/ri';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // orders | addresses | reviews
  const [isEditing, setIsEditing] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleStartSave = (e) => {
    e.preventDefault();
    setShowOtpPopup(true);
  };

  const handleOtpVerified = () => {
    updateUser({ name, email, phone });
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* User Information Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: '700',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>
              {user?.name || 'Valued Painter'}
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              📞 +91 {user?.phone || 'Not set'} • ✉️ {user?.email || 'Not set'}
            </div>
            <div style={{ marginTop: '6px' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '700',
                  backgroundColor: 'var(--color-secondary-light)',
                  color: '#7B5E00',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                LEO PRIVILEGE CLUB MEMBER
              </span>
            </div>
          </div>
        </div>

        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setName(user?.name || '');
              setEmail(user?.email || '');
              setPhone(user?.phone || '');
              setIsEditing(true);
            }}
            icon={<RiEditLine />}
          >
            Edit Profile
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <form
            onSubmit={handleStartSave}
            style={{
              width: '100%',
              paddingTop: '20px',
              marginTop: '12px',
              borderTop: '1px solid var(--color-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Registered Mobile"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button type="submit" variant="primary" fullWidth size="md" icon={<RiShieldKeyholeLine />}>
                Verify OTP & Save
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs Navigation: Orders, Addresses, Reviews */}
      <div>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            borderBottom: '2px solid var(--color-border)',
            marginBottom: '20px',
          }}
        >
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '12px 16px',
              fontSize: '0.9375rem',
              fontWeight: activeTab === 'orders' ? '700' : '500',
              color: activeTab === 'orders' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'orders' ? '3px solid var(--color-primary)' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <RiShoppingBag3Line size={18} />
            <span>My Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            style={{
              padding: '12px 16px',
              fontSize: '0.9375rem',
              fontWeight: activeTab === 'addresses' ? '700' : '500',
              color: activeTab === 'addresses' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'addresses' ? '3px solid var(--color-primary)' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <RiMapPinLine size={18} />
            <span>Saved Addresses</span>
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'orders' && <OrderHistory />}
        {activeTab === 'addresses' && <AddressManager />}
      </div>

      {/* OTP Popup for Profile Update */}
      <OtpPopup
        isOpen={showOtpPopup}
        onClose={() => setShowOtpPopup(false)}
        onVerified={handleOtpVerified}
        targetPhone={phone}
        title="Verify Profile Changes"
      />
    </div>
  );
};

export default ProfilePage;
