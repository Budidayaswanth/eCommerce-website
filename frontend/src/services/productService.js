import api from './api';

const productService = {
  /**
   * Fetch paginated & filtered products from real backend
   */
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    // Handles { success: true, data: { content: [...] } } or direct array
    const data = response.data?.data || response.data;
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  /**
   * Fetch single product by slug or id from real backend
   */
  async getProductBySlug(slug) {
    const response = await api.get(`/products/${slug}`);
    return response.data?.data || response.data;
  },

  /**
   * Real backend product search
   */
  async searchProducts(query) {
    if (!query || !query.trim()) return [];
    const response = await api.get('/products/search', {
      params: { q: query.trim() },
    });
    const data = response.data?.data || response.data;
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  /**
   * Fetch category tree from real backend
   */
  async getCategories() {
    const response = await api.get('/categories');
    return response.data?.data || response.data || [];
  },

  /**
   * Fetch featured products from real backend
   */
  async getFeaturedProducts() {
    const response = await api.get('/products', {
      params: { size: 8, sortBy: 'rating' },
    });
    const data = response.data?.data || response.data;
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },
};

export default productService;
