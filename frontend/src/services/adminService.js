import api from './api';
import { MOCK_PRODUCTS } from './productService';

const MOCK_ADMIN_STATS = {
  totalRevenue: 489240,
  totalOrders: 184,
  totalUsers: 1420,
  lowStockCount: 4,
  revenueChange: '+18.4% vs last month',
  ordersChange: '+12.1% vs last month',
  usersChange: '+24.6% vs last month',
  dailyRevenue: [
    { date: 'Oct 01', revenue: 14200 },
    { date: 'Oct 03', revenue: 19800 },
    { date: 'Oct 05', revenue: 15400 },
    { date: 'Oct 07', revenue: 23600 },
    { date: 'Oct 09', revenue: 28900 },
    { date: 'Oct 11', revenue: 31200 },
    { date: 'Oct 13', revenue: 34500 },
  ],
};

let MOCK_USERS_LIST = [
  { id: 'usr-1', name: 'Yaswanth Kumar', email: 'yaswanth@example.com', phone: '9876543210', ordersCount: 4, status: 'ACTIVE', joinedDate: '2026-08-10' },
  { id: 'usr-2', name: 'Priya Sundaram', email: 'priya.s@example.com', phone: '9845012345', ordersCount: 2, status: 'ACTIVE', joinedDate: '2026-09-01' },
  { id: 'usr-3', name: 'Vikram Patel', email: 'vikram.p@example.com', phone: '9712345678', ordersCount: 1, status: 'ACTIVE', joinedDate: '2026-09-14' },
  { id: 'usr-4', name: 'Rohan Mehra', email: 'rohan.m@example.com', phone: '9923456789', ordersCount: 0, status: 'BLOCKED', joinedDate: '2026-09-22' },
];

let MOCK_BANNERS_LIST = [
  { id: 'ban-1', title: 'Festive Season Grand Sale', subtitle: 'Flat 25% Off on All Luxury Emulsions & Textures', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=80', link: '/explore/interior-paints', active: true, order: 1 },
  { id: 'ban-2', title: 'Monsoon Proof Exterior Shield', subtitle: '10-Year Anti-Algae & Waterproof Defense', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&auto=format&fit=crop&q=80', link: '/explore/exterior-paints', active: true, order: 2 },
  { id: 'ban-3', title: 'Natural Wood & Deck Lustre', subtitle: 'German PU Formulations for Exotic Teak & Oak', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80', link: '/explore/wood-finishes', active: true, order: 3 },
];

let MOCK_AUDIT_LOGS = [
  { id: 'log-1', timestamp: '2026-10-13T10:14:00Z', action: 'UPDATE_STOCK', entity: 'Product (Ultima WeatherShield)', performedBy: 'admin@leopaints.com', details: 'Stock updated from 20 to 28' },
  { id: 'log-2', timestamp: '2026-10-12T16:20:00Z', action: 'COUPON_CREATED', entity: 'Coupon (FESTIVE25)', performedBy: 'admin@leopaints.com', details: 'Added 25% festive promo' },
  { id: 'log-3', timestamp: '2026-10-11T11:05:00Z', action: 'STATUS_CHANGED', entity: 'Order (ORD-984210)', performedBy: 'system', details: 'Status transitioned to DELIVERED' },
  { id: 'log-4', timestamp: '2026-10-10T09:30:00Z', action: 'REVIEW_APPROVED', entity: 'Review (rev-1)', performedBy: 'admin@leopaints.com', details: 'Approved 5-star review from Rajesh V.' },
];

let MOCK_PENDING_REVIEWS = [
  {
    id: 'rev-pending-1',
    productId: 'prod-3',
    productName: 'DampLock Pro Hydrophobic Waterproofing Barrier',
    userName: 'Karthik Rao',
    rating: 5,
    title: 'Zero seepage through terrace leaks!',
    comment: 'Applied 3 coats over cracked terrace parapet. Withstood recent storms flawlessly.',
    createdAt: '2026-10-12T15:20:00Z',
    status: 'PENDING',
  },
  {
    id: 'rev-pending-2',
    productId: 'prod-6',
    productName: 'Metallo Stucco Designer Metallic Texture',
    userName: 'Deepa N.',
    rating: 4,
    title: 'Looks like a 5-star hotel foyer',
    comment: 'Gold finish gives luxurious hotel feel. Painter took 4 hours to burnish.',
    createdAt: '2026-10-11T18:00:00Z',
    status: 'PENDING',
  },
];

let adminProducts = [...MOCK_PRODUCTS];

const adminService = {
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/stats');
      if (response.data) return response.data;
    } catch {}
    return MOCK_ADMIN_STATS;
  },

  async getUsers() {
    try {
      const response = await api.get('/admin/users');
      if (response.data) return response.data;
    } catch {}
    return MOCK_USERS_LIST;
  },

  async toggleUserBlock(userId) {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      if (res.data) return res.data;
    } catch {}
    MOCK_USERS_LIST = MOCK_USERS_LIST.map((u) =>
      u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' } : u
    );
    return MOCK_USERS_LIST.find((u) => u.id === userId);
  },

  async getAllOrders() {
    try {
      const response = await api.get('/admin/orders');
      if (response.data) return response.data;
    } catch {}
    return [
      {
        id: 'ORD-984210',
        customerName: 'Yaswanth Kumar',
        phone: '9876543210',
        amount: 1847,
        status: 'DELIVERED',
        date: '2026-10-11',
        itemsCount: 3,
        paymentStatus: 'PAID',
      },
      {
        id: 'ORD-984211',
        customerName: 'Priya Sundaram',
        phone: '9845012345',
        amount: 2596,
        status: 'PROCESSING',
        date: '2026-10-13',
        itemsCount: 4,
        paymentStatus: 'PAID',
      },
      {
        id: 'ORD-984212',
        customerName: 'Vikram Patel',
        phone: '9712345678',
        amount: 899,
        status: 'CONFIRMED',
        date: '2026-10-13',
        itemsCount: 1,
        paymentStatus: 'PAID',
      },
      {
        id: 'ORD-984213',
        customerName: 'Amit Trivedi',
        phone: '9123456780',
        amount: 1149,
        status: 'PENDING',
        date: '2026-10-13',
        itemsCount: 1,
        paymentStatus: 'PENDING',
      },
    ];
  },

  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
      if (response.data) return response.data;
    } catch {}
    return { success: true, orderId, status };
  },

  // Products CRUD
  async getProducts() {
    try {
      const response = await api.get('/admin/products');
      if (response.data) return response.data;
    } catch {}
    return adminProducts;
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/admin/products', productData);
      if (response.data) return response.data;
    } catch {}
    const newProd = {
      ...productData,
      id: `prod-${Date.now()}`,
      slug: (productData.name || 'new-product').toLowerCase().replace(/\s+/g, '-'),
      rating: 5.0,
      reviewCount: 0,
      stock: Number(productData.stock) || 10,
      price: Number(productData.price) || 500,
      mrp: Number(productData.mrp) || 600,
      images: [productData.image],
    };
    adminProducts.unshift(newProd);
    return newProd;
  },

  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/admin/products/${id}`, productData);
      if (response.data) return response.data;
    } catch {}
    adminProducts = adminProducts.map((p) => (p.id === id ? { ...p, ...productData } : p));
    return adminProducts.find((p) => p.id === id);
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/admin/products/${id}`);
    } catch {}
    adminProducts = adminProducts.filter((p) => p.id !== id);
    return { success: true };
  },

  // Coupons CRUD
  async getCoupons() {
    try {
      const response = await api.get('/admin/coupons');
      if (response.data) return response.data;
    } catch {}
    return [
      { id: 'cpn-1', code: 'LEO10', discountPercent: 10, maxDiscount: 500, minOrderValue: 500, active: true },
      { id: 'cpn-2', code: 'FESTIVE25', discountPercent: 25, maxDiscount: 1500, minOrderValue: 2000, active: true },
      { id: 'cpn-3', code: 'FLAT200', flatDiscount: 200, minOrderValue: 1000, active: true },
    ];
  },

  async saveCoupon(couponData) {
    try {
      const response = await api.post('/admin/coupons', couponData);
      if (response.data) return response.data;
    } catch {}
    return { id: `cpn-${Date.now()}`, ...couponData };
  },

  // Banners CRUD
  async getBanners() {
    try {
      const response = await api.get('/admin/banners');
      if (response.data) return response.data;
    } catch {}
    return MOCK_BANNERS_LIST;
  },

  async saveBanner(bannerData) {
    try {
      const response = await api.post('/admin/banners', bannerData);
      if (response.data) return response.data;
    } catch {}
    const newBanner = { id: bannerData.id || `ban-${Date.now()}`, ...bannerData };
    const index = MOCK_BANNERS_LIST.findIndex((b) => b.id === newBanner.id);
    if (index >= 0) {
      MOCK_BANNERS_LIST[index] = newBanner;
    } else {
      MOCK_BANNERS_LIST.push(newBanner);
    }
    return newBanner;
  },

  async deleteBanner(bannerId) {
    try {
      await api.delete(`/admin/banners/${bannerId}`);
    } catch {}
    MOCK_BANNERS_LIST = MOCK_BANNERS_LIST.filter((b) => b.id !== bannerId);
    return { success: true };
  },

  // Audit Logs
  async getAuditLogs() {
    try {
      const response = await api.get('/admin/audit-logs');
      if (response.data) return response.data;
    } catch {}
    return MOCK_AUDIT_LOGS;
  },

  // Reviews moderation
  async getPendingReviews() {
    try {
      const response = await api.get('/admin/reviews/pending');
      if (response.data) return response.data;
    } catch {}
    return MOCK_PENDING_REVIEWS;
  },

  async approveReview(reviewId, approved = true) {
    try {
      const response = await api.patch(`/admin/reviews/${reviewId}`, { approved });
      if (response.data) return response.data;
    } catch {}
    MOCK_PENDING_REVIEWS = MOCK_PENDING_REVIEWS.filter((r) => r.id !== reviewId);
    return { success: true };
  },
};

export default adminService;
