/**
 * Validate 10-digit Indian mobile number
 * Starts with 6, 7, 8, or 9
 */
export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length !== 10) {
    return 'Phone number must be exactly 10 digits';
  }
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return 'Enter a valid Indian mobile number starting with 6, 7, 8 or 9';
  }
  return null;
};

/**
 * Validate standard email format
 */
export const validateEmail = (email) => {
  if (!email) return 'Email address is required';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(String(email).toLowerCase())) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate required field with optional custom label
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate 6-digit OTP
 */
export const validateOtp = (otp) => {
  if (!otp) return 'OTP is required';
  const cleaned = String(otp).trim();
  if (!/^\d{6}$/.test(cleaned)) {
    return 'OTP must be exactly 6 digits';
  }
  return null;
};

/**
 * Validate 6-digit Indian PIN Code
 */
export const validatePincode = (pincode) => {
  if (!pincode) return 'Pincode is required';
  const cleaned = String(pincode).trim();
  if (!/^\d{6}$/.test(cleaned)) {
    return 'Pincode must be 6 digits';
  }
  return null;
};
