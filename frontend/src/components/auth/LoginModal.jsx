import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../context/AuthContext';
import { validatePhone, validateEmail } from '../../utils/validators';
import { RiSmartphoneLine, RiShieldCheckLine, RiUserLine, RiMailLine, RiRefreshLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose }) => {
  const { sendOtp, verifyOtp } = useAuth();

  // Steps: 1 = Phone, 2 = OTP, 3 = Register details
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [loading, setLoading] = useState(false);
  const otpInputsRef = useRef([]);

  // Reset modal state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPhone('');
      setPhoneError('');
      setOtp(['', '', '', '', '', '']);
      setTimer(30);
      setCanResend(false);
      setName('');
      setEmail('');
    }
  }, [isOpen]);

  // Resend countdown timer
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      return;
    }
    setPhoneError('');
    setLoading(true);

    try {
      await sendOtp(phone);
      toast.success(`OTP sent to +91 ${phone}`);
      setStep(2);
      setTimer(30);
      setCanResend(false);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle 6-digit OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto advance focus
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    const completeOtp = newOtp.join('');
    if (completeOtp.length === 6) {
      handleVerifyOtp(completeOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode) => {
    const code = otpCode || otp.join('');
    if (code.length < 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ phone, otp: code, name, email });
      if (res.isNewUser && !name) {
        setStep(3);
      } else {
        onClose();
      }
    } catch (err) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Profile for new user
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    let valid = true;
    if (!name.trim()) {
      setNameError('Full name is required');
      valid = false;
    } else {
      setNameError('');
    }

    if (email.trim()) {
      const emailErr = validateEmail(email);
      if (emailErr) {
        setEmailError(emailErr);
        valid = false;
      } else {
        setEmailError('');
      }
    }

    if (!valid) return;

    setLoading(true);
    try {
      await verifyOtp({ phone, otp: otp.join(''), name, email });
      onClose();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? 'Login or Sign Up' : step === 2 ? 'Verify Mobile OTP' : 'Complete Your Profile'}
      maxWidth="440px"
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src="/logo.jpg"
          alt="Leo Paints"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            margin: '0 auto 12px',
            boxShadow: 'var(--shadow-sm)',
            objectFit: 'cover',
          }}
        />
        <h4 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>
          {step === 1 && 'Welcome to Leo Paints'}
          {step === 2 && `Enter 6-Digit Code`}
          {step === 3 && 'Almost There!'}
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          {step === 1 && 'Enter your mobile number to get an instant verification code'}
          {step === 2 && `We sent an SMS with OTP to +91 ${phone}`}
          {step === 3 && 'Tell us your name so we can personalize your paint orders'}
        </p>
      </div>

      {/* STEP 1: Phone input */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
              Mobile Number
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  backgroundColor: 'var(--color-bg-page)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-btn)',
                  fontWeight: '600',
                  color: 'var(--color-primary-dark)',
                  fontSize: '0.9375rem',
                }}
              >
                🇮🇳 +91
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(digits);
                    if (phoneError) setPhoneError('');
                  }}
                  error={phoneError}
                  autoFocus
                />
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg" isLoading={loading}>
            Get OTP
          </Button>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
            By continuing, you agree to Leo Paints Terms of Use and Privacy Policy.
          </p>
        </form>
      )}

      {/* STEP 2: 6 Individual OTP Boxes */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (otpInputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                style={{
                  width: '46px',
                  height: '52px',
                  textAlign: 'center',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  borderRadius: 'var(--radius-btn)',
                  border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: digit ? 'var(--color-primary-subtle)' : '#FFFFFF',
                  color: 'var(--color-primary-dark)',
                }}
                className="otp-box"
              />
            ))}
          </div>

          <Button
            variant="primary"
            fullWidth
            size="lg"
            isLoading={loading}
            onClick={() => handleVerifyOtp()}
          >
            Verify & Proceed
          </Button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
            }}
          >
            <button
              onClick={() => setStep(1)}
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}
            >
              Change Number
            </button>

            {canResend ? (
              <button
                onClick={handleSendOtp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--color-primary)',
                  fontWeight: '600',
                }}
              >
                <RiRefreshLine size={16} /> Resend OTP
              </button>
            ) : (
              <span style={{ color: 'var(--color-text-muted)' }}>Resend in {timer}s</span>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Complete profile */}
      {step === 3 && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            placeholder="e.g. Yaswanth Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            icon={<RiUserLine />}
            required
            autoFocus
          />

          <Input
            label="Email Address (Optional)"
            placeholder="painter@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            icon={<RiMailLine />}
          />

          <Button type="submit" variant="primary" fullWidth size="lg" isLoading={loading}>
            Complete Registration
          </Button>
        </form>
      )}

      <style>{`
        .otp-box:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.15) !important;
          outline: none;
        }
      `}</style>
    </Modal>
  );
};

export default LoginModal;
