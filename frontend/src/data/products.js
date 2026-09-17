// src/data/products.js
import { ProductService } from '../services/ProductService';

// Initialize products array synchronously from cache if available
export let products = ProductService.getInitialProducts();

// Listeners to notify components/consumers when products finish fetching
const listeners = new Set();

export const subscribeProducts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Asynchronously fetch products on startup from public APIs via ProductService
ProductService.getProducts().then((fetchedData) => {
  if (fetchedData && fetchedData.length > 0) {
    products.length = 0;
    products.push(...fetchedData);
    listeners.forEach(fn => typeof fn === 'function' && fn(products));
  }
}).catch((err) => {
  console.warn('Initial background ProductService fetch encountered error:', err);
});

export { ProductService };
