// src/services/sellerService.js
// Client API for Seller Store, Products CRUD & Order Fulfillment

import { api } from './api';

export const sellerService = {
  /**
   * Onboard current user as seller and create initial store
   * @param {{ store_name: string, description?: string, phone?: string, address?: string }} storeData
   */
  async onboard(storeData) {
    const res = await api.post('seller/onboard', storeData);
    return res?.data || res;
  },

  /**
   * Get store profile information of authenticated seller
   */
  async getStore() {
    const res = await api.get('seller/store');
    return res?.data || res;
  },

  /**
   * Update seller store profile (name, description, phone, address, etc.)
   * @param {object} storeData
   */
  async updateStore(storeData) {
    const res = await api.patch('seller/store', storeData);
    return res?.data || res;
  },

  /**
   * Get all products belonging to current seller
   */
  async getProducts() {
    const res = await api.get('seller/products');
    return res?.data || res;
  },

  /**
   * Get single product details by ID (must belong to seller)
   * @param {string} productId
   */
  async getProductById(productId) {
    const res = await api.get(`seller/products/${productId}`);
    return res?.data || res;
  },

  /**
   * Create a new product for seller store
   * @param {{ name: string, category_id: string, price: number, stock: number, description: string, image: string, featured?: boolean }} productData
   */
  async createProduct(productData) {
    const res = await api.post('seller/products', productData);
    return res?.data || res;
  },

  /**
   * Update existing product by seller
   * @param {string} productId
   * @param {object} productData
   */
  async updateProduct(productId, productData) {
    const res = await api.patch(`seller/products/${productId}`, productData);
    return res?.data || res;
  },

  /**
   * Delete product by seller
   * @param {string} productId
   */
  async deleteProduct(productId) {
    const res = await api.delete(`seller/products/${productId}`);
    return res?.data || res;
  },

  /**
   * Get all customer orders containing items from this seller
   */
  async getOrders() {
    const res = await api.get('seller/orders');
    return res?.data || res;
  },

  /**
   * Update status of an order (processing, shipped, delivered, completed)
   * @param {string} orderId
   * @param {string} status
   * @param {string|null} trackingNumber
   */
  async updateOrderStatus(orderId, status, trackingNumber = null) {
    const payload = { status };
    if (trackingNumber) {
      payload.tracking_number = trackingNumber;
    }
    const res = await api.patch(`seller/orders/${orderId}/status`, payload);
    return res?.data || res;
  },
};
