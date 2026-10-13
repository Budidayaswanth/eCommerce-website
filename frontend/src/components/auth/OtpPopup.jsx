import React, { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import authService from '../../services/authService';
import { RiRefreshLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const OtpPopup = ({ isOpen, onClose, onVerified, title = 'Security Verification', targetPhone }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);

  // Reset and trigger initial timer on open
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimer(30);
      setCanResend(false);
      setTimeout(() => inputsRef.current[0]?.focus(), 150);
    }
  }, [isOpen]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits entered
    const completeCode = newOtp.join('');
    if (completeCode.length === 6) {
      handleVerify(completeCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || loading || !targetPhone) return;
    setLoading(true);
    try {
      await authService.resendOtp(targetPhone);
      toast.success(`New OTP sent to +91 ${targetPhone}`);
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || otp.join('');
    if (code.length < 6) {
      toast.error('Please enter all 6 digits of the OTP');
      return;
    }

    setLoading(true);
    try {
      if (onVerified) {
        await onVerified(code);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Verification failed. Please check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="420px">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
          For your account security, enter the 6-digit verification code sent to{' '}
          {targetPhone ? <strong>+91 {targetPhone}</strong> : 'your registered mobile number'}.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
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
              width: '44px',
              height: '50px',
              textAlign: 'center',
              fontSize: '1.25rem',
              fontWeight: '700',
              borderRadius: 'var(--radius-btn)',
              border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--color-border)'}`,
              backgroundColor: digit ? 'var(--color-primary-subtle)' : '#FFFFFF',
              color: 'var(--color-primary-dark)',
            }}
          />
        ))}
      </div>

      {/* Resend OTP Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '24px',
          fontSize: '0.8125rem',
        }}
      >
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--color-primary)',
              fontWeight: '600',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            <RiRefreshLine size={15} /> Resend OTP
          </button>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>Resend code in {timer}s</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="outline" fullWidth onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" fullWidth onClick={() => handleVerify()} isLoading={loading}>
          Confirm Update
        </Button>
      </div>
    </Modal>
  );
};

export default OtpPopup;
