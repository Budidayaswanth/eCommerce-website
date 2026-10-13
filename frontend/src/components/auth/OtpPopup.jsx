import React, { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const OtpPopup = ({ isOpen, onClose, onVerified, title = 'Security Verification', targetPhone }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputsRef.current[0]?.focus(), 150);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter all 6 digits of the OTP');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Identity verified successfully');
      onVerified(code);
      onClose();
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
          For your account security, please verify the 6-digit code sent to your registered number{' '}
          {targetPhone && <strong>(+91 {targetPhone})</strong>}.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            style={{
              width: '42px',
              height: '48px',
              textAlign: 'center',
              fontSize: '1.2rem',
              fontWeight: '700',
              borderRadius: 'var(--radius-btn)',
              border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--color-border)'}`,
              backgroundColor: digit ? 'var(--color-primary-subtle)' : '#FFFFFF',
              color: 'var(--color-primary-dark)',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="outline" fullWidth onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" fullWidth onClick={handleVerify} isLoading={loading}>
          Confirm Update
        </Button>
      </div>
    </Modal>
  );
};

export default OtpPopup;
