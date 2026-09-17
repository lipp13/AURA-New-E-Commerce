// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { ProductService } from '../services/ProductService';

export const useProducts = () => {
  const [products, setProducts] = useState(() => ProductService.getInitialProducts());
  const [loading, setLoading] = useState(() => ProductService.getInitialProducts().length === 0);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getProducts(forceRefresh);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refetch: () => loadProducts(true)
  };
};
