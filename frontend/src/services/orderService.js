import api from './api';

const orderService = {
  /**
   * Create order from cart
   */
  async createOrder(orderPayload) {
    const response = await api.post('/orders', orderPayload);
    return response.data?.data || response.data;
  },

  /**
   * Fetch current customer's order history
   */
  async getOrders(params = {}) {
    const response = await api.get('/orders', { params });
    const data = response.data?.data || response.data;
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    return Array.isArray(data) ? data : [];
  },

  /**
   * Fetch single order details
   */
  async getOrderById(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data?.data || response.data;
  },

  /**
   * Cancel an order with specified cancellation reason
   */
  async cancelOrder(orderId, reason = '') {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data?.data || response.data;
  },

  /**
   * Archive an order
   */
  async archiveOrder(orderId) {
    const response = await api.put(`/orders/${orderId}/archive`);
    return response.data?.data || response.data;
  },

  /**
   * Unarchive / Restore an order back to active history
   */
  async unarchiveOrder(orderId) {
    const response = await api.put(`/orders/${orderId}/unarchive`);
    return response.data?.data || response.data;
  },
};

export default orderService;
