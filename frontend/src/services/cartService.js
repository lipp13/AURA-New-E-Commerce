// src/services/cartService.js
// Cart API Service connected to Supabase backend endpoints
import { api } from './api';

export const cartService = {
  async getCart() {
    const res = await api.get('cart');
    return res?.data || res;
  },

  async addItem(productId, quantity = 1) {
    const res = await api.post('cart/items', { productId, quantity });
    return res?.data || res;
  },

  async updateItem(itemId, quantity) {
    const res = await api.patch(`cart/items/${itemId}`, { quantity });
    return res?.data || res;
  },

  async removeItem(itemId) {
    const res = await api.delete(`cart/items/${itemId}`);
    return res?.data || res;
  },

  async clearCart() {
    const res = await api.delete('cart');
    return res?.data || res;
  },
};
