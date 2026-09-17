import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [savedForLater, setSavedForLater] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_saved_for_later');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_saved_for_later', JSON.stringify(savedForLater));
    } catch (e) {}
  }, [savedForLater]);

  const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null) => {
    if (!product) return;
    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.product && item.product.id === product.id &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, {
          product,
          quantity,
          selectedColor: selectedColor || (product.colors ? product.colors[0] : null),
          selectedSize: selectedSize || (product.sizes ? product.sizes[0] : null),
        }];
      }
    });
  };

  const updateQuantity = (id, quantity, color, size) => {
    if (quantity <= 0) {
      removeFromCart(id, color, size);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product && item.product.id === id && item.selectedColor === color && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (id, color, size) => {
    setCart(prev =>
      prev.filter(item => !(item.product && item.product.id === id && item.selectedColor === color && item.selectedSize === size))
    );
  };

  const moveToSavedForLater = (cartItem) => {
    if (!cartItem || !cartItem.product) return;
    removeFromCart(cartItem.product.id, cartItem.selectedColor, cartItem.selectedSize);
    setSavedForLater(prev => [...prev, cartItem]);
  };

  const moveToCartFromSaved = (savedItem) => {
    if (!savedItem || !savedItem.product) return;
    setSavedForLater(prev =>
      prev.filter(
        item => !(item.product && item.product.id === savedItem.product.id && item.selectedColor === savedItem.selectedColor && item.selectedSize === savedItem.selectedSize)
      )
    );
    addToCart(savedItem.product, savedItem.quantity, savedItem.selectedColor, savedItem.selectedSize);
  };

  const removeSavedItem = (savedItem) => {
    if (!savedItem || !savedItem.product) return;
    setSavedForLater(prev =>
      prev.filter(
        item => !(item.product && item.product.id === savedItem.product.id && item.selectedColor === savedItem.selectedColor && item.selectedSize === savedItem.selectedSize)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const applyCoupon = (code) => {
    if (!code) return { success: false, message: 'Masukkan kode kupon yang valid' };
    if (code.toUpperCase() === 'AURA10') {
      setCoupon({ code: 'AURA10', discountPercentage: 10 });
      return { success: true, message: 'Kupon diskon 10% berhasil digunakan!' };
    } else if (code.toUpperCase() === 'APPLE20') {
      setCoupon({ code: 'APPLE20', discountPercentage: 20 });
      return { success: true, message: 'Kupon VIP diskon 20% berhasil digunakan!' };
    }
    return { success: false, message: 'Kode kupon tidak valid' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const subtotal = cart.reduce((acc, item) => {
    if (!item || !item.product || typeof item.product.price !== 'number') return acc;
    return acc + item.product.price * (item.quantity || 1);
  }, 0);

  const discountAmount = coupon ? Math.round((subtotal * coupon.discountPercentage) / 100) : 0;
  const shippingFee = subtotal >= 100000 || cart.length === 0 ? 0 : 15000;
  const tax = 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + tax);
  const totalItemsCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{
      cart,
      savedForLater,
      addToCart,
      updateQuantity,
      removeFromCart,
      moveToSavedForLater,
      moveToCartFromSaved,
      removeSavedItem,
      clearCart,
      coupon,
      applyCoupon,
      removeCoupon,
      subtotal,
      discountAmount,
      shippingFee,
      tax,
      grandTotal,
      totalItemsCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
