import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

const getStoredCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : { items: [], totalAmount: 0, totalItems: 0 };
  } catch {
    return { items: [], totalAmount: 0, totalItems: 0 };
  }
};

const saveStoredCart = (cart) => {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
};

const cartService = {
  async getCart() {
    try {
      const response = await api.get('/cart');
      const data = response.data?.data || response.data;
      if (data && data.items) {
        saveStoredCart(data);
        return data;
      }
    } catch {}
    return getStoredCart();
  },

  async addItem(product, quantity = 1, selectedSize = '4 Litres', selectedFinish = 'Matte') {
    // If authenticated, sync with backend to get authentic DB ID
    try {
      const response = await api.post('/cart/items', {
        productId: product.id,
        quantity,
        size: selectedSize,
        finish: selectedFinish,
      });
      const data = response.data?.data || response.data;
      if (data && data.items) {
        saveStoredCart(data);
        return data;
      }
    } catch (err) {
      if (err.status) throw err;
    }

    // Unauthenticated guest local storage
    const current = getStoredCart();
    const existingIndex = current.items.findIndex(
      (item) => item.product?.id === product.id && item.size === selectedSize && item.finish === selectedFinish
    );

    if (existingIndex > -1) {
      current.items[existingIndex].quantity += quantity;
    } else {
      current.items.push({
        id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product,
        size: selectedSize,
        finish: selectedFinish,
        price: product.price,
        quantity,
      });
    }

    current.totalItems = current.items.reduce((sum, item) => sum + item.quantity, 0);
    current.totalAmount = current.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    saveStoredCart(current);

    return current;
  },

  async updateQuantity(itemId, quantity) {
    const current = getStoredCart();
    if (quantity <= 0) {
      current.items = current.items.filter((i) => i.id !== itemId);
    } else {
      const target = current.items.find((i) => i.id === itemId);
      if (target) {
        target.quantity = quantity;
      }
    }

    current.totalItems = current.items.reduce((sum, item) => sum + item.quantity, 0);
    current.totalAmount = current.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    saveStoredCart(current);

    // If server ID, sync with backend
    if (typeof itemId === 'number' || (!String(itemId).startsWith('guest-') && !String(itemId).startsWith('cart-item-'))) {
      try {
        const response = await api.put(`/cart/items/${itemId}?quantity=${quantity}`);
        const data = response.data?.data || response.data;
        if (data && data.items) {
          saveStoredCart(data);
          return data;
        }
      } catch {}
    }

    return current;
  },

  async removeItem(itemId) {
    const current = getStoredCart();
    current.items = current.items.filter((i) => i.id !== itemId);
    current.totalItems = current.items.reduce((sum, item) => sum + item.quantity, 0);
    current.totalAmount = current.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    saveStoredCart(current);

    // If server ID, sync with backend
    if (typeof itemId === 'number' || (!String(itemId).startsWith('guest-') && !String(itemId).startsWith('cart-item-'))) {
      try {
        const response = await api.delete(`/cart/items/${itemId}`);
        const data = response.data?.data || response.data;
        if (data && data.items) {
          saveStoredCart(data);
          return data;
        }
      } catch {}
    }

    return current;
  },

  async clearCart() {
    const empty = { items: [], totalAmount: 0, totalItems: 0 };
    saveStoredCart(empty);

    try {
      await api.delete('/cart');
    } catch {}

    return empty;
  },
};

export default cartService;
