import api from './api';

const MOCK_REVIEWS = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userName: 'Rajesh V.',
    rating: 5,
    title: 'Remarkable finish & rich color depth!',
    comment: 'Applied two coats on our living room feature wall. The pearl finish shines subtly under warm spotlighting. Low odor was a huge blessing.',
    verifiedPurchase: true,
    createdAt: '2026-10-02T10:30:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userName: 'Ananya Sharma',
    rating: 5,
    title: 'Easy to wipe clean with toddler at home',
    comment: 'My daughter drew with crayons and it wiped off with a damp microfiber cloth without peeling. True to the Teflon claim.',
    verifiedPurchase: true,
    createdAt: '2026-09-24T14:15:00Z',
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    userName: 'Suresh Menon',
    rating: 4,
    title: 'Solid protection through heavy rains',
    comment: 'Finished our villa exterior before the monsoon. No water seepage or algae spots so far. Premium quality product.',
    verifiedPurchase: true,
    createdAt: '2026-09-18T09:40:00Z',
  },
];

const reviewService = {
  async getProductReviews(productId) {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      if (response.data && response.data.length > 0) return response.data;
    } catch {}

    const reviews = MOCK_REVIEWS.filter((r) => r.productId === productId);
    return reviews.length > 0 ? reviews : MOCK_REVIEWS.slice(0, 2);
  },

  async addReview(reviewData) {
    try {
      const response = await api.post(`/products/${reviewData.productId}/reviews`, reviewData);
      if (response.data) return response.data;
    } catch {}

    const newRev = {
      id: `rev-${Date.now()}`,
      productId: reviewData.productId,
      userName: reviewData.userName || 'Verified Buyer',
      rating: reviewData.rating || 5,
      title: reviewData.title || 'Great Quality Paint',
      comment: reviewData.comment,
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };
    MOCK_REVIEWS.unshift(newRev);
    return newRev;
  },
};

export default reviewService;
