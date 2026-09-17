import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_compare');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aura_compare', JSON.stringify(compareList));
    } catch (e) {}
  }, [compareList]);

  const addToCompare = (product) => {
    if (!product || !product.id) return { success: false, message: 'Objek tidak valid' };
    if (compareList.length >= 4) {
      return { success: false, message: 'Maksimal 4 objek yang dapat dibandingkan sekaligus.' };
    }
    if (compareList.some(item => item && item.id === product.id)) {
      return { success: false, message: 'Objek sudah ada dalam daftar pembanding.' };
    }
    setCompareList(prev => [...prev, product]);
    return { success: true, message: 'Berhasil ditambahkan ke daftar pembanding.' };
  };

  const removeFromCompare = (productId) => {
    setCompareList(prev => prev.filter(item => item && item.id !== productId));
  };

  const isInCompare = (productId) => {
    return compareList.some(item => item && item.id === productId);
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within CompareProvider');
  return context;
};
