import api from './api';

const paymentService = {
  async createPaymentSession(orderData) {
    const response = await api.post('/payments/create-session', {
      orderId: orderData.orderId,
    });
    return response.data?.data || response.data;
  },

  async verifyPayment(paymentDetails) {
    const response = await api.post('/payments/verify', {
      orderId: paymentDetails.orderId,
      cfOrderId: paymentDetails.cfOrderId || `cf_${paymentDetails.orderId}`,
    });
    return response.data?.data || response.data;
  },

  async initiateRefund(paymentId, amount) {
    const response = await api.post(`/payments/admin/${paymentId}/refund`, {
      amount,
    });
    return response.data?.data || response.data;
  },
};

export default paymentService;
