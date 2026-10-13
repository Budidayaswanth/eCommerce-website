import api from './api';

const AVAILABLE_COUPONS = [
  {
    code: 'LEO10',
    discountPercent: 10,
    maxDiscount: 500,
    minOrderValue: 500,
    description: '10% off up to ₹500 on all orders',
  },
  {
    code: 'FESTIVE25',
    discountPercent: 25,
    maxDiscount: 1500,
    minOrderValue: 2000,
    description: '25% off up to ₹1,500 on orders above ₹2,000',
  },
  {
    code: 'FLAT200',
    flatDiscount: 200,
    minOrderValue: 1000,
    description: 'Flat ₹200 off on orders above ₹1,000',
  },
];

const couponService = {
  async validateCoupon(code, orderAmount = 0) {
    const cleanCode = code ? code.trim().toUpperCase() : '';
    try {
      const response = await api.post('/coupons/validate', { code: cleanCode, orderAmount });
      if (response.data) return response.data;
    } catch {}

    const found = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);
    if (!found) {
      throw new Error('Invalid promo code. Please check and try again.');
    }

    if (orderAmount < found.minOrderValue) {
      throw new Error(`Minimum order of ₹${found.minOrderValue} required for coupon ${found.code}`);
    }

    let discountAmount = 0;
    if (found.flatDiscount) {
      discountAmount = found.flatDiscount;
    } else if (found.discountPercent) {
      discountAmount = Math.min((orderAmount * found.discountPercent) / 100, found.maxDiscount);
    }

    return {
      valid: true,
      code: found.code,
      discount: Math.round(discountAmount),
      description: found.description,
    };
  },

  getAvailableCoupons() {
    return AVAILABLE_COUPONS;
  },
};

export default couponService;
