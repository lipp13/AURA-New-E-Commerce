// src/hooks/useCategories.js
import { useState, useEffect, useCallback } from 'react';
import { ProductService } from '../services/ProductService';
import { categories as defaultCategories } from '../data/categories';

export const useCategories = () => {
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getCategories();
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (err) {
      console.warn('Error fetching categories from backend:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refetch: loadCategories,
  };
};
