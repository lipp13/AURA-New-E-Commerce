// src/services/api.js
// Centralized HTTP API client for backend integration

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-aura-seven.vercel.app/api';

class ApiClient {
  constructor(baseUrl) {
    let clean = (baseUrl || '').trim().replace(/\/+$/, '');
    if (clean && !clean.endsWith('/api')) {
      clean = `${clean}/api`;
    }
    this.baseUrl = clean || 'https://backend-aura-seven.vercel.app/api';
  }

  getToken() {
    try {
      return localStorage.getItem('aura_token') || null;
    } catch {
      return null;
    }
  }

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem('aura_token', token);
      } else {
        localStorage.removeItem('aura_token');
      }
    } catch (e) {
      console.error('Error saving aura_token:', e);
    }
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers),
    };

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage = (isJson && data?.message) || response.statusText || 'Terjadi kesalahan pada server';
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      // If network fails (e.g. backend server not running yet), wrap into informative error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const netErr = new Error(`Koneksi ke backend (${this.baseUrl}) gagal. Pastikan server backend sedang aktif.`);
        netErr.isNetworkError = true;
        throw netErr;
      }
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    const fullPath = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullPath, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
export { API_BASE_URL };
