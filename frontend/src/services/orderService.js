// src/services/orderService.js
// Orders & Checkout API Service matching RegaSyakib/e-commerce-BE

import { api } from './api';

export const orderService = {
  /**
   * Fetch order history for authenticated user (GET /api/orders)
   * @param {string} [status] Optional filter: 'all' | 'pending' | 'acc' | 'cancelled'
   * @returns {Promise<Array>}
   */
  async getOrders(status = 'all') {
    const res = await api.get('orders', status !== 'all' ? { status } : {});
    const items = Array.isArray(res) ? res : (res?.data || res?.orders || []);
    return Array.isArray(items) ? items : [];
  },

  /**
   * Create a new order after checkout (POST /api/orders)
   * @param {{
   *   recipient_name: string,
   *   phone: string,
   *   address: string,
   *   city: string,
   *   postal_code: string,
   *   courier?: string,
   *   payment_method?: 'bank_transfer' | 'qris',
   *   bank_name?: string
   * }} orderPayload
   * @returns {Promise<object>}
   */
  async createOrder(orderPayload) {
    const res = await api.post('orders', orderPayload);
    return res?.data || res;
  },

  /**
   * Fetch specific order details by ID or order_number (GET /api/orders/:id)
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  async getOrderById(orderId) {
    const res = await api.get(`orders/${orderId}`);
    return res?.data || res;
  },

  /**
   * Cancel user's pending order (PATCH /api/orders/:id/cancel)
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  async cancelOrder(orderId) {
    const res = await api.patch(`orders/${orderId}/cancel`);
    return res?.data || res;
  },

  /**
   * Upload payment proof for an order (POST /api/orders/:id/payment-proof)
   * @param {string} orderId
   * @param {File} file
   */
  async uploadPaymentProof(orderId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = api.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${api.baseUrl}/orders/${orderId}/payment-proof`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Gagal mengunggah bukti pembayaran.');
    }

    return json?.data || json;
  },

  /**
   * Simulate instant payment completion (POST /api/payments/orders/:id/simulate)
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  async simulatePayment(orderId) {
    const res = await api.post(`payments/orders/${orderId}/simulate`);
    return res?.data || res;
  },
};
