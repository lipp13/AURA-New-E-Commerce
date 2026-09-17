// src/services/authService.js
// Authentication & User Profile API Service matching RegaSyakib/e-commerce-BE

import { api } from './api';

export const authService = {
  /**
   * Login user with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login(email, password) {
    const res = await api.post('auth/login', { email, password });
    const payload = res?.data || res;
    const token = payload?.token || res?.token;

    if (token) {
      api.setToken(token);
    }

    return {
      success: true,
      user: payload?.user || payload,
      token,
      refreshToken: payload?.refreshToken,
      message: res?.message || 'Login berhasil!',
    };
  },

  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string, phone?: string, role?: string }} userData
   * @returns {Promise<{ user: object, token: string }>}
   */
  async register(userData) {
    const body = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user',
      phone: userData.phone || null,
    };

    const res = await api.post('auth/register', body);
    const payload = res?.data || res;
    const token = payload?.token || res?.token;

    if (token) {
      api.setToken(token);
    }

    return {
      success: true,
      user: payload?.user || payload,
      token,
      message: res?.message || 'Pendaftaran akun berhasil!',
    };
  },

  /**
   * Fetch current authenticated user's profile from GET /api/auth/me
   * @returns {Promise<object>}
   */
  async getProfile() {
    const res = await api.get('auth/me');
    return res?.data || res;
  },

  /**
   * Update current user's profile information via PATCH /api/auth/me
   * @param {object} updatedData
   * @returns {Promise<object>}
   */
  async updateProfile(updatedData) {
    const res = await api.patch('auth/me', updatedData);
    return res?.data || res;
  },

  /**
   * Logout user and clear session token
   */
  async logout() {
    try {
      await api.post('auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      api.setToken(null);
    }
  },
};
