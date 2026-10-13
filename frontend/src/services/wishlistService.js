import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

const getStoredWishlist = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredWishlist = (items) => {
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(items));
};

const wishlistService = {
  async getWishlist() {
    try {
      const response = await api.get('/wishlist');
      if (response.data) {
        saveStoredWishlist(response.data);
        return response.data;
      }
    } catch {}
    return getStoredWishlist();
  },

  async addToWishlist(product) {
    const list = getStoredWishlist();
    if (!list.some((item) => item.id === product.id)) {
      list.push(product);
      saveStoredWishlist(list);
    }
    try {
      await api.post('/wishlist', { productId: product.id });
    } catch {}
    return list;
  },

  async removeFromWishlist(productId) {
    const list = getStoredWishlist().filter((p) => p.id !== productId);
    saveStoredWishlist(list);
    try {
      await api.delete(`/wishlist/${productId}`);
    } catch {}
    return list;
  },
};

export default wishlistService;
