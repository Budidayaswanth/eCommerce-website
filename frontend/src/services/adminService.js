import api from './api';

const adminService = {
  /**
   * Get real dashboard statistics (revenue, orders today, total users, low stock items)
   */
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data?.data || response.data;
  },

  /**
   * Fetch all registered users
   */
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    const data = response.data?.data || response.data;
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    return Array.isArray(data) ? data : [];
  },

  /**
   * Toggle active/blocked status of a user
   */
  async toggleUserBlock(userId) {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data?.data || response.data;
  },

  /**
   * Fetch all orders with optional status filter and pagination
   */
  async getAllOrders(params = {}) {
    const response = await api.get('/admin/orders', { params });
    const data = response.data?.data || response.data;
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    return Array.isArray(data) ? data : [];
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    const response = await api.put(`/admin/orders/${orderId}/status`, { status });
    return response.data?.data || response.data;
  },

  /**
   * Fetch all products for admin catalog management
   */
  async getProducts(params = {}) {
    const response = await api.get('/admin/products', { params });
    const data = response.data?.data || response.data;
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    return Array.isArray(data) ? data : [];
  },

  /**
   * Create new product
   */
  async createProduct(productData) {
    const response = await api.post('/admin/products', productData);
    return response.data?.data || response.data;
  },

  /**
   * Update existing product
   */
  async updateProduct(productId, productData) {
    const response = await api.put(`/admin/products/${productId}`, productData);
    return response.data?.data || response.data;
  },

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data?.data || response.data;
  },

  /**
   * Fetch all discount coupons
   */
  async getCoupons() {
    const response = await api.get('/admin/coupons');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.content || [];
  },

  /**
   * Create or update coupon
   */
  async saveCoupon(couponData) {
    if (couponData.id) {
      const response = await api.put(`/admin/coupons/${couponData.id}`, couponData);
      return response.data?.data || response.data;
    }
    const response = await api.post('/admin/coupons', couponData);
    return response.data?.data || response.data;
  },

  /**
   * Delete coupon
   */
  async deleteCoupon(couponId) {
    const response = await api.delete(`/admin/coupons/${couponId}`);
    return response.data?.data || response.data;
  },

  /**
   * Fetch promotional banners
   */
  async getBanners() {
    const response = await api.get('/admin/banners');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.content || [];
  },

  /**
   * Save promotional banner
   */
  async saveBanner(bannerData) {
    if (bannerData.id) {
      const response = await api.put(`/admin/banners/${bannerData.id}`, bannerData);
      return response.data?.data || response.data;
    }
    const response = await api.post('/admin/banners', bannerData);
    return response.data?.data || response.data;
  },

  /**
   * Delete banner
   */
  async deleteBanner(bannerId) {
    const response = await api.delete(`/admin/banners/${bannerId}`);
    return response.data?.data || response.data;
  },

  /**
   * Fetch system audit logs with optional filter
   */
  async getAuditLogs(params = {}) {
    const response = await api.get('/admin/audit-logs', { params });
    const data = response.data?.data || response.data;
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    return Array.isArray(data) ? data : [];
  },

  /**
   * Fetch pending reviews awaiting moderation
   */
  async getPendingReviews() {
    const response = await api.get('/admin/reviews/pending');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.content || [];
  },

  /**
   * Approve customer review
   */
  async approveReview(reviewId) {
    const response = await api.put(`/admin/reviews/${reviewId}/approve`);
    return response.data?.data || response.data;
  },

  /**
   * Reject / delete customer review
   */
  async rejectReview(reviewId) {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data?.data || response.data;
  },

  /**
   * Get unread chats for admin helpdesk
   */
  async getUnreadChats() {
    const response = await api.get('/admin/chat/unread');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Send admin reply to customer chat session
   */
  async adminReply(sessionId, message) {
    const response = await api.post('/admin/chat/reply', { sessionId, message });
    return response.data?.data || response.data;
  },

  /**
   * Get full session chat messages
   */
  async getSessionMessages(sessionId) {
    const response = await api.get(`/chat/messages/${sessionId}`);
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};

export default adminService;
