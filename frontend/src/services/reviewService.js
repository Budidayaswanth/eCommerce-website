import api from './api';

const reviewService = {
  /**
   * Fetch approved customer reviews for a product
   */
  async getProductReviews(productId, params = {}) {
    if (!productId) return [];
    const response = await api.get(`/reviews/product/${productId}`, { params });
    const data = response.data?.data || response.data;
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    return Array.isArray(data) ? data : [];
  },

  /**
   * Submit review for a product
   */
  async addReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data?.data || response.data;
  },
};

export default reviewService;
