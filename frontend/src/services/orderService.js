import api from './api';

const MOCK_ORDERS = [
  {
    id: 'ORD-984210',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'DELIVERED',
    totalAmount: 1847,
    items: [
      {
        id: 'ord-it-1',
        name: 'Royale Velvet Touch Luxury Interior Emulsion',
        size: '4 Litres',
        finish: 'Eggshell',
        quantity: 2,
        price: 499,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'ord-it-2',
        name: 'PrimeCoat Alkali-Resistant Masonry Primer',
        size: '4 Litres',
        finish: 'Matte',
        quantity: 1,
        price: 299,
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop&q=80',
      },
    ],
    deliveryAddress: {
      name: 'Yaswanth Kumar',
      phone: '9876543210',
      street: 'Flat 402, Royal Palms, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
    },
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    trackingNumber: 'DTDC-IND-8849201',
    estimatedDelivery: 'Oct 15, 2026',
  },
  {
    id: 'ORD-984211',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'PROCESSING',
    totalAmount: 2596,
    items: [
      {
        id: 'ord-it-3',
        name: 'Ultima WeatherShield Max Exterior Acrylic',
        size: '10 Litres',
        finish: 'Semi-Gloss',
        quantity: 4,
        price: 649,
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=300&auto=format&fit=crop&q=80',
      },
    ],
    deliveryAddress: {
      name: 'Yaswanth Kumar',
      phone: '9876543210',
      street: 'Flat 402, Royal Palms, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
    },
    paymentMethod: 'ONLINE_CARD',
    paymentStatus: 'PAID',
    trackingNumber: 'BLUEDART-LP-19042',
    estimatedDelivery: 'Oct 17, 2026',
  },
];

const orderService = {
  async createOrder(orderPayload) {
    try {
      const response = await api.post('/orders', orderPayload);
      if (response.data) return response.data;
    } catch {
      // Local mock creation
    }

    const newOrder = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
      totalAmount: orderPayload.totalAmount || 1299,
      items: orderPayload.items || [],
      deliveryAddress: orderPayload.shippingAddress,
      paymentMethod: orderPayload.paymentMethod || 'UPI',
      paymentStatus: 'PAID',
      trackingNumber: `EXP-LEO-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDelivery: '3-4 Business Days',
    };

    MOCK_ORDERS.unshift(newOrder);
    return newOrder;
  },

  async getOrders() {
    try {
      const response = await api.get('/orders');
      if (response.data) return response.data;
    } catch {
      // Return mock orders
    }
    return MOCK_ORDERS;
  },

  async getOrderById(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      if (response.data) return response.data;
    } catch {}

    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    return order || MOCK_ORDERS[0];
  },

  async cancelOrder(orderId, reason = '') {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`, { reason });
      if (response.data) return response.data;
    } catch {}

    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (order) {
      order.status = 'CANCELLED';
      order.cancellationReason = reason;
      return order;
    }
    return { success: true };
  },
};

export default orderService;
