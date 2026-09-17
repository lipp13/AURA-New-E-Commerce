import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();

  // Load current user session from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('aura_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Local users register fallback
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load order history from localStorage
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem('aura_orders');
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      return [];
    }
  });

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Sync current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('aura_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('aura_current_user');
      }
    } catch (e) {
      console.warn('Failed to sync current user:', e);
    }
  }, [currentUser]);

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_users', JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to sync users:', e);
    }
  }, [users]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to sync orders:', e);
    }
  }, [orders]);

  // Try to load orders from backend if user is authenticated
  useEffect(() => {
    if (currentUser) {
      orderService.getOrders()
        .then((remoteOrders) => {
          if (Array.isArray(remoteOrders) && remoteOrders.length > 0) {
            setOrders(remoteOrders);
          }
        })
        .catch(() => {
          // Backend orders endpoint not ready, local storage orders are maintained
        });
    }
  }, [currentUser]);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try backend API login first
    try {
      const response = await authService.login(trimmedEmail, password);
      if (response && response.user) {
        setCurrentUser(response.user);
        addToast(`Selamat datang kembali, ${response.user.name}!`, 'success');
        closeAuthModal();
        return { success: true };
      }
    } catch (backendError) {
      // If network error (backend not running yet), allow fallback to local users
      if (!backendError.isNetworkError) {
        const message = backendError.message || 'Gagal masuk akun.';
        addToast(message, 'error');
        return { success: false, message };
      }
    }

    // 2. Offline / Local fallback
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      addToast(`Selamat datang kembali, ${foundUser.name}!`, 'success');
      closeAuthModal();
      return { success: true };
    } else {
      const emailExists = users.some((u) => u.email.toLowerCase() === trimmedEmail);
      const errorMsg = emailExists
        ? 'Kata sandi yang Anda masukkan salah.'
        : 'Akun dengan email ini belum terdaftar. Silakan lakukan pendaftaran terlebih dahulu.';
      addToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }
  };

  const register = async ({ name, email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // 1. Try backend API register first
    try {
      const response = await authService.register({ name: trimmedName, email: trimmedEmail, password });
      if (response && response.user) {
        setCurrentUser(response.user);
        addToast(`Pendaftaran berhasil! Selamat datang di AURA, ${response.user.name}.`, 'success');
        closeAuthModal();
        return { success: true };
      }
    } catch (backendError) {
      if (!backendError.isNetworkError) {
        const message = backendError.message || 'Pendaftaran akun gagal.';
        addToast(message, 'error');
        return { success: false, message };
      }
    }

    // 2. Offline / Local fallback
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      const errorMsg = 'Email ini sudah terdaftar. Silakan login.';
      addToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password: password,
      phone: '',
      address: '',
      city: '',
      country: 'Indonesia',
      zip: '',
      role: 'Member',
      avatar: null,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast(`Pendaftaran berhasil! Selamat datang di AURA, ${newUser.name}.`, 'success');
    closeAuthModal();
    return { success: true };
  };

  const logout = () => {
    const userName = currentUser?.name || 'Pengguna';
    authService.logout();
    setCurrentUser(null);
    addToast(`Berhasil keluar dari akun (${userName}).`, 'info');
  };

  const updateProfile = async (updatedData) => {
    if (!currentUser) return;
    const newProfile = { ...currentUser, ...updatedData };
    setCurrentUser(newProfile);

    try {
      await authService.updateProfile(updatedData);
    } catch {
      // Offline fallback
    }

    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === newProfile.id ? newProfile : u))
    );
    addToast('Profil berhasil diperbarui', 'success');
  };

  const updatePassword = async (currentPassword, newPassword) => {
    if (!currentUser) return { success: false, message: 'Tidak ada sesi login.' };

    try {
      await authService.updatePassword(currentPassword, newPassword);
      addToast('Kata sandi berhasil diperbarui!', 'success');
      return { success: true };
    } catch (backendError) {
      if (!backendError.isNetworkError) {
        addToast(backendError.message, 'error');
        return { success: false, message: backendError.message };
      }
    }

    if (currentUser.password && currentUser.password !== currentPassword) {
      const errorMsg = 'Kata sandi lama Anda salah.';
      addToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }

    const updated = { ...currentUser, password: newPassword };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    addToast('Kata sandi berhasil diubah!', 'success');
    return { success: true };
  };

  const addOrder = async (orderData) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const newOrder = {
      id: `AU-${Math.floor(100000 + Math.random() * 900000)}`,
      date: formattedDate,
      total: orderData.total,
      status: 'Diproses',
      items: orderData.items || [],
      tracking: `JNE YES ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      userEmail: (orderData.userEmail || currentUser?.email || 'tamu@aura.design').toLowerCase(),
      shipping: orderData.shippingData,
      paymentMethod: orderData.paymentMethod,
    };

    try {
      const remote = await orderService.createOrder({
        recipient_name: orderData.shippingData?.name || currentUser?.name || 'Tamu AURA',
        phone: orderData.shippingData?.phone || currentUser?.phone || '08123456789',
        address: orderData.shippingData?.address || 'Jl. Jenderal Sudirman No. 1',
        city: orderData.shippingData?.city || 'Jakarta',
        postal_code: orderData.shippingData?.zip || orderData.shippingData?.postalCode || '10110',
        courier: orderData.shippingData?.courier || 'Standard Delivery',
        payment_method: orderData.paymentMethod === 'card' || orderData.paymentMethod === 'qris' ? 'qris' : 'bank_transfer',
        bank_name: orderData.bankName || 'BCA',
        ...orderData,
        ...newOrder,
      });
      if (remote && (remote.id || remote.order_number || remote.orderNumber)) {
        const orderId = remote.order_number || remote.orderNumber || remote.id;
        const normalizedRemote = {
          ...newOrder,
          ...remote,
          id: orderId,
        };
        setOrders((prev) => [normalizedRemote, ...prev]);
        addToast(`Pesanan #${orderId} telah berhasil dibuat!`, 'success');
        return normalizedRemote;
      }
    } catch {
      // Backend order processing fallback
    }

    setOrders((prev) => [newOrder, ...prev]);
    addToast(`Pesanan #${newOrder.id} telah berhasil dibuat!`, 'success');
    return newOrder;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        orders,
        isAuthenticated: !!currentUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
