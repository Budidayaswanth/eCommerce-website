import api from './api';

const normalizeProduct = (p) => {
  if (!p) return p;
  const price = p.price ?? (p.sellingPrice != null ? Number(p.sellingPrice) : 0);
  const mrp = p.mrp ?? (p.listingPrice != null ? Number(p.listingPrice) : price);
  const image = p.image || p.imageUrl || '/products/royale_emulsion.jpg';
  const images = (p.images && p.images.length > 0)
    ? p.images
    : [p.imageUrl, p.imageUrl2, p.imageUrl3].filter(Boolean);
  if (images.length === 0) images.push(image);
  const stock = p.stockQuantity != null ? Number(p.stockQuantity) : 25;
  const discount = p.discount || p.discountPercent || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const rating = p.rating || (p.avgRating != null ? Number(p.avgRating) : 4.6);
  const reviewCount = p.reviewCount != null ? Number(p.reviewCount) : 32;
  const coverage = p.coverage || (p.coverageSqft ? `${p.coverageSqft} sq.ft / Litre` : '120-140 sq.ft / Litre');
  const colorHex = p.colorHex || '#1A237E';
  const color = p.color || 'Royal Velvet Navy';
  const sizes = p.sizes || ['1 Litre', '4 Litres', '10 Litres', '20 Litres'];
  const finish = p.finish || 'Matte';
  const paintType = p.paintType || 'Luxury Emulsion';

  return {
    ...p,
    price,
    mrp,
    image,
    images,
    stockQuantity: stock,
    inStock: stock > 0 && p.isActive !== false,
    discount,
    rating,
    reviewCount,
    coverage,
    color,
    colorHex,
    sizes,
    finish,
    paintType,
    categoryName: p.categoryName || (typeof p.category === 'object' ? p.category?.name : p.category) || 'Architectural Paints',
  };
};

const productService = {
  /**
   * Fetch paginated & filtered products from real backend
   */
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    // Handles { success: true, data: { content: [...] } } or direct array
    const data = response.data?.data || response.data;
    if (data?.content && Array.isArray(data.content)) {
      return data.content.map(normalizeProduct);
    }
    if (Array.isArray(data)) {
      return data.map(normalizeProduct);
    }
    return [];
  },

  /**
   * Fetch single product by slug or id from real backend
   */
  async getProductBySlug(slug) {
    const response = await api.get(`/products/${slug}`);
    const raw = response.data?.data || response.data;
    return normalizeProduct(raw);
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
      return data.content.map(normalizeProduct);
    }
    if (Array.isArray(data)) {
      return data.map(normalizeProduct);
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
      return data.content.map(normalizeProduct);
    }
    if (Array.isArray(data)) {
      return data.map(normalizeProduct);
    }
    return [];
  },
};

export default productService;
