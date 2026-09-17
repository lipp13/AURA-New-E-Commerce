// src/services/wishlistService.js
// Wishlist API Service connected to Supabase backend endpoints
import { api } from './api';

export const wishlistService = {
  async getWishlist() {
    const res = await api.get('wishlist');
    return res?.data || res;
  },

  async add(productId) {
    const res = await api.post(`wishlist/${productId}`);
    return res?.data || res;
  },

  async remove(productId) {
    const res = await api.delete(`wishlist/${productId}`);
    return res?.data || res;
  },

  async moveToCart() {
    const res = await api.post('wishlist/move-to-cart');
    return res?.data || res;
  },
};
