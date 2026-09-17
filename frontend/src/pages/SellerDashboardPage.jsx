// src/pages/SellerDashboardPage.jsx
// Complete Luxury Editorial Minimalist Seller Portal for AURA / OBJEK

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Truck,
  CheckCircle2,
  X,
  Clock,
  ArrowRight,
  Eye,
  Settings,
  AlertCircle,
  UploadCloud,
  ImageIcon,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sellerService } from '../services/sellerService';
import { ProductService } from '../services/ProductService';
import { formatPrice } from '../utils/formatters';
import { compressImage } from '../utils/imageCompressor';

export const SellerDashboardPage = () => {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products'); // 'overview' | 'products' | 'orders' | 'settings'

  // Data states
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  // Image Upload & Auto-compression states
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [compressionStats, setCompressionStats] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '10',
    description: '',
    image: '',
    featured: false,
  });

  // Store Settings Form State
  const [storeForm, setStoreForm] = useState({
    store_name: '',
    description: '',
    phone: '',
    address: '',
  });

  // Load initial data
  const loadSellerData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Store
      try {
        const storeData = await sellerService.getStore();
        if (storeData) {
          setStore(storeData);
          setStoreForm({
            store_name: storeData.store_name || '',
            description: storeData.description || '',
            phone: storeData.phone || '',
            address: storeData.address || '',
          });
        }
      } catch (e) {
        console.warn('Store fetch fallback:', e);
      }

      // 2. Fetch Seller Products
      try {
        const productsData = await sellerService.getProducts();
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        }
      } catch (e) {
        console.warn('Products fetch fallback:', e);
      }

      // 3. Fetch Seller Orders
      try {
        const ordersData = await sellerService.getOrders();
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        }
      } catch (e) {
        console.warn('Orders fetch fallback:', e);
      }

      // 4. Fetch Categories for Form Dropdown
      try {
        const catData = await ProductService.getCategories();
        if (Array.isArray(catData)) {
          setCategories(catData);
          if (catData.length > 0 && !productForm.category_id) {
            setProductForm((prev) => ({ ...prev, category_id: catData[0].id }));
          }
        }
      } catch (e) {
        console.warn('Categories fetch fallback:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSellerData();
    }
  }, [isAuthenticated]);

  // If user is guest
  if (!isAuthenticated) {
    return (
      <div className="pt-36 pb-28 max-w-md mx-auto text-center space-y-4 px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">[Autentikasi Diperlukan]</span>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#171717]">
          Masuk ke Portal Penjual
        </h2>
        <p className="font-mono text-xs text-[#6B675F]">
          Silakan masuk dengan akun yang telah terdaftar sebagai penjual.
        </p>
        <Button onClick={() => openAuthModal('login')}>Masuk Sekarang</Button>
      </div>
    );
  }

  // If user is not a seller yet
  if (currentUser?.role !== 'seller') {
    return (
      <div className="pt-36 pb-28 max-w-lg mx-auto text-center space-y-6 px-6">
        <div className="w-16 h-16 mx-auto bg-[#FAF8F2] border border-[#D8D2C6] rounded-full flex items-center justify-center text-[#171717]">
          <Store className="w-8 h-8 text-[#F4512A]" />
        </div>
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">[Akses Dibatasi]</span>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#171717]">
            Anda Belum Membuka Toko
          </h2>
          <p className="font-mono text-xs text-[#6B675F]">
            Akun Anda saat ini berstatus Pembeli. Buka toko sekarang dalam 1 langkah mudah untuk mulai menjual produk di AURA.
          </p>
        </div>
        <Button onClick={() => navigate('/seller/register')} fullWidth>
          Buka Toko Sekarang →
        </Button>
      </div>
    );
  }

  // Metrics
  const totalProductsCount = products.length;
  const totalOrdersCount = orders.length;
  const totalRevenue = orders
    .filter((o) => ['processing', 'shipped', 'delivered', 'completed'].includes(o.status))
    .reduce((acc, curr) => acc + (curr.sellerSubtotal || 0), 0);

  // Handlers for Products
  const handleOpenAddModal = () => {
    setProductForm({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      stock: '10',
      description: '',
      image: '',
      featured: false,
    });
    setSelectedImageFile(null);
    setImagePreview('');
    setCompressionStats(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      category_id: product.categoryId || categories[0]?.id || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
      image: product.image || '',
      featured: !!product.featured,
    });
    setSelectedImageFile(null);
    setImagePreview(product.image || '');
    setCompressionStats(null);
    setIsEditModalOpen(true);
  };

  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      addToast('Mengompresi gambar produk secara otomatis...', 'info');
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
        outputType: 'image/webp',
      });

      setSelectedImageFile(compressed.file);
      setImagePreview(compressed.dataUrl);
      setCompressionStats(compressed);
      setProductForm((prev) => ({
        ...prev,
        image: compressed.dataUrl,
      }));

      addToast(
        `Gambar berhasil dikompresi: ${compressed.originalFormatted} → ${compressed.compressedFormatted} (Hemat ${compressed.savingsPercent}%)`,
        'success'
      );
    } catch (err) {
      console.error('Image compression error:', err);
      addToast(err.message || 'Gagal mengompresi gambar.', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      addToast('Nama produk dan harga wajib diisi.', 'error');
      return;
    }

    if (!selectedImageFile && !productForm.image) {
      addToast('Wajib mengunggah gambar produk dari galeri/penyimpanan perangkat.', 'error');
      return;
    }

    try {
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('name', productForm.name.trim());
        formData.append('category_id', productForm.category_id);
        formData.append('price', Number(productForm.price));
        formData.append('stock', Number(productForm.stock || 0));
        formData.append('description', productForm.description.trim());
        formData.append('featured', productForm.featured);
        formData.append('image', selectedImageFile);

        await sellerService.createProduct(formData);
      } else {
        const payload = {
          name: productForm.name.trim(),
          category_id: productForm.category_id,
          price: Number(productForm.price),
          stock: Number(productForm.stock || 0),
          description: productForm.description.trim(),
          image: productForm.image.trim(),
          featured: productForm.featured,
        };
        await sellerService.createProduct(payload);
      }

      addToast('Produk berhasil ditambahkan ke katalog toko Anda!', 'success');
      setIsAddModalOpen(false);
      loadSellerData();
    } catch (err) {
      addToast(err.message || 'Gagal menambahkan produk.', 'error');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('name', productForm.name.trim());
        formData.append('category_id', productForm.category_id);
        formData.append('price', Number(productForm.price));
        formData.append('stock', Number(productForm.stock || 0));
        formData.append('description', productForm.description.trim());
        formData.append('featured', productForm.featured);
        formData.append('image', selectedImageFile);

        await sellerService.updateProduct(selectedProduct.id, formData);
      } else {
        const payload = {
          name: productForm.name.trim(),
          category_id: productForm.category_id,
          price: Number(productForm.price),
          stock: Number(productForm.stock || 0),
          description: productForm.description.trim(),
          image: productForm.image.trim(),
          featured: productForm.featured,
        };
        await sellerService.updateProduct(selectedProduct.id, payload);
      }

      addToast('Produk berhasil diperbarui.', 'success');
      setIsEditModalOpen(false);
      loadSellerData();
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui produk.', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?')) {
      return;
    }

    try {
      await sellerService.deleteProduct(productId);
      addToast('Produk berhasil dihapus.', 'success');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      addToast(err.message || 'Gagal menghapus produk.', 'error');
    }
  };

  // Handlers for Orders
  const handleProcessOrder = async (orderId) => {
    try {
      await sellerService.updateOrderStatus(orderId, 'processing');
      addToast('Status pesanan diubah ke: Sedang Dikemas.', 'success');
      loadSellerData();
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui pesanan.', 'error');
    }
  };

  const handleOpenShipModal = (order) => {
    setSelectedOrder(order);
    setTrackingInput(`AURA-EXP-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsShipModalOpen(true);
  };

  const handleConfirmShipping = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await sellerService.updateOrderStatus(selectedOrder.orderId, 'shipped', trackingInput);
      addToast(`Pesanan #${selectedOrder.orderNumber} telah dikirim dengan No. Resi ${trackingInput}`, 'success');
      setIsShipModalOpen(false);
      loadSellerData();
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui status pengiriman.', 'error');
    }
  };

  // Handlers for Store Settings
  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    try {
      const updated = await sellerService.updateStore(storeForm);
      setStore(updated);
      addToast('Informasi toko berhasil disimpan.', 'success');
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui toko.', 'error');
    }
  };

  return (
    <div className="pt-28 pb-24 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Beranda', path: '/' },
          { label: 'Portal Penjual', path: '/seller' },
        ]}
      />

      {/* Header Banner */}
      <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#171717] text-[#F5F1E8]">
              [SELLER TERVERIFIKASI]
            </span>
            <span className="font-mono text-xs text-[#6B675F]">
              ID: {currentUser?.id?.slice(0, 8)}...
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#171717]">
            {store?.store_name || `Toko ${currentUser?.name}`}
          </h1>
          <p className="font-mono text-xs text-[#6B675F] max-w-xl">
            {store?.description || 'Kelola katalog produk, pantau transaksi pelanggan, dan proses pengiriman pesanan Anda.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleOpenAddModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Produk Baru
          </Button>
          <Link
            to="/shop"
            className="p-3 border border-[#D8D2C6] bg-[#F5F1E8] hover:border-[#171717] text-[#171717] transition-colors"
            title="Lihat Katalog Publik"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 border border-[#D8D2C6] bg-[#FAF8F2] font-mono space-y-1">
          <div className="flex items-center justify-between text-[#6B675F]">
            <span className="text-xs uppercase tracking-wider">Katalog Produk</span>
            <Package className="w-4 h-4" />
          </div>
          <p className="font-display text-3xl font-extrabold text-[#171717]">
            {totalProductsCount}
          </p>
          <span className="text-[10px] text-[#6B675F]">Objek terdaftar aktif</span>
        </div>

        <div className="p-6 border border-[#D8D2C6] bg-[#FAF8F2] font-mono space-y-1">
          <div className="flex items-center justify-between text-[#6B675F]">
            <span className="text-xs uppercase tracking-wider">Pesanan Masuk</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="font-display text-3xl font-extrabold text-[#171717]">
            {totalOrdersCount}
          </p>
          <span className="text-[10px] text-[#6B675F]">Total transaksi pelanggan</span>
        </div>

        <div className="p-6 border border-[#D8D2C6] bg-[#FAF8F2] font-mono space-y-1">
          <div className="flex items-center justify-between text-[#6B675F]">
            <span className="text-xs uppercase tracking-wider">Estimasi Omset</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#171717]">
            {formatPrice(totalRevenue)}
          </p>
          <span className="text-[10px] text-emerald-700">Transaksi lunas & diproses</span>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="border-b border-[#D8D2C6] flex gap-8 font-mono text-xs uppercase tracking-widest">
        {[
          { id: 'products', label: `Katalog Produk (${products.length})`, icon: Package },
          { id: 'orders', label: `Pesanan Masuk (${orders.length})`, icon: ShoppingBag },
          { id: 'settings', label: 'Profil Toko', icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-4 flex items-center gap-2 border-b-2 transition-colors ${
                isActive
                  ? 'border-[#171717] text-[#171717] font-bold'
                  : 'border-transparent text-[#6B675F] hover:text-[#171717]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {products.length === 0 ? (
            <div className="p-12 border border-dashed border-[#D8D2C6] text-center space-y-4 bg-[#FAF8F2]">
              <Package className="w-10 h-10 mx-auto text-[#6B675F]" />
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-wider font-bold text-[#171717]">
                  Belum Ada Produk di Toko Anda
                </p>
                <p className="font-mono text-xs text-[#6B675F]">
                  Mulai tambahkan objek dan produk kurasi pertama Anda ke pasar AURA.
                </p>
              </div>
              <Button onClick={handleOpenAddModal}>+ Tambah Produk Sekarang</Button>
            </div>
          ) : (
            <div className="border border-[#D8D2C6] bg-[#FAF8F2] overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#F5F1E8] border-b border-[#D8D2C6] uppercase text-[#6B675F] tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Produk</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Harga</th>
                    <th className="p-4">Stok</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D2C6]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F5F1E8]/60 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.image || '/favicon.svg'}
                          alt={p.name}
                          className="w-12 h-12 object-cover bg-white border border-[#D8D2C6] shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200';
                          }}
                        />
                        <div>
                          <p className="font-bold text-[#171717]">{p.name}</p>
                          <span className="text-[10px] text-[#6B675F] truncate block max-w-xs">
                            {p.description || 'Tidak ada deskripsi'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-[#6B675F]">{p.category || 'Umum'}</td>
                      <td className="p-4 font-bold text-[#171717]">{formatPrice(p.price)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold ${
                          p.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {p.stock > 0 ? `${p.stock} Unit` : 'Habis'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] uppercase tracking-wider text-[#171717] font-semibold">
                          {p.isActive !== false ? '● Aktif' : '○ Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 border border-[#D8D2C6] bg-white hover:border-[#171717] text-[#171717] transition-colors"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 border border-[#D8D2C6] bg-white hover:border-rose-600 text-rose-600 transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 border border-dashed border-[#D8D2C6] text-center space-y-4 bg-[#FAF8F2]">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#6B675F]" />
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-wider font-bold text-[#171717]">
                  Belum Ada Pesanan Masuk
                </p>
                <p className="font-mono text-xs text-[#6B675F]">
                  Saat ada pelanggan yang membeli produk dari toko Anda, rincian pesanan akan otomatis tampil di sini.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => {
                const statusStyles = {
                  pending: 'bg-amber-100 text-amber-900 border-amber-300',
                  processing: 'bg-blue-100 text-blue-900 border-blue-300',
                  shipped: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  completed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  cancelled: 'bg-rose-100 text-rose-900 border-rose-300',
                };

                return (
                  <div
                    key={ord.orderId}
                    className="border border-[#D8D2C6] bg-[#FAF8F2] p-6 space-y-4 font-mono text-xs"
                  >
                    {/* Header Order */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8D2C6] pb-4 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#171717] text-sm">
                          #{ord.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 border text-[10px] uppercase tracking-wider font-bold ${
                            statusStyles[ord.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <span className="text-[#6B675F] text-[11px]">
                        {new Date(ord.createdAt).toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5F1E8] p-4 border border-[#D8D2C6]">
                      <div>
                        <span className="text-[10px] text-[#6B675F] uppercase tracking-widest block">
                          [Pembeli &amp; Kontak]
                        </span>
                        <p className="font-bold text-[#171717]">{ord.recipient?.name || 'Pelanggan'}</p>
                        <p className="text-[#6B675F]">{ord.recipient?.phone || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6B675F] uppercase tracking-widest block">
                          [Alamat Pengiriman]
                        </span>
                        <p className="text-[#171717]">{ord.recipient?.address}, {ord.recipient?.city}</p>
                        <p className="text-[#6B675F]">{ord.courier || 'Kurir Reguler'}</p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 border-b border-[#D8D2C6] pb-3">
                      <span className="text-[10px] text-[#6B675F] uppercase tracking-widest block">
                        [Item Pesanan]
                      </span>
                      {(ord.sellerItems || []).map((item) => (
                        <div key={item.itemId} className="flex justify-between items-center text-[#171717]">
                          <span>{item.quantity}x {item.productName}</span>
                          <span className="font-bold">{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Action Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                      <div>
                        <span className="text-[#6B675F] text-[11px]">Total Pendapatan Toko:</span>
                        <p className="font-display text-lg font-bold text-[#171717]">
                          {formatPrice(ord.sellerSubtotal)}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {ord.status === 'pending' && (
                          <button
                            onClick={() => handleProcessOrder(ord.orderId)}
                            className="px-4 py-2 bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] transition-colors text-xs font-bold uppercase tracking-wider"
                          >
                            Kemas Pesanan
                          </button>
                        )}

                        {ord.status === 'processing' && (
                          <button
                            onClick={() => handleOpenShipModal(ord)}
                            className="px-4 py-2 bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Kirim &amp; Input Resi</span>
                          </button>
                        )}

                        {ord.status === 'shipped' && (
                          <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold">
                            ✓ Paket Dalam Perjalanan
                          </span>
                        )}

                        {['delivered', 'completed'].includes(ord.status) && (
                          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                            ✓ Transaksi Selesai
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: STORE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-8 max-w-2xl space-y-6">
          <div className="border-b border-[#D8D2C6] pb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
              [Pengaturan Toko]
            </span>
            <h2 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
              Profil Toko Penjual
            </h2>
          </div>

          <form onSubmit={handleSaveStoreSettings} className="space-y-4">
            <Input
              label="Nama Toko"
              value={storeForm.store_name}
              onChange={(e) => setStoreForm({ ...storeForm, store_name: e.target.value })}
              required
            />

            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                Deskripsi Toko
              </label>
              <textarea
                rows={3}
                className="w-full bg-[#F5F1E8] border border-[#D8D2C6] p-3 text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717] transition-colors"
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nomor WhatsApp / Kontak"
                value={storeForm.phone}
                onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
              />
              <Input
                label="Kota / Lokasi Toko"
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-[#D8D2C6]">
              <Button type="submit">Simpan Perubahan Toko</Button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: TAMBAH PRODUK BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#FAF8F2] border border-[#D8D2C6] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#D8D2C6] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
                  [Katalog Toko]
                </span>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
                  Tambah Objek Baru
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#6B675F] hover:text-[#171717]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <Input
                label="Nama Objek / Produk *"
                placeholder="Contoh: Lampu Meja Skulptural Aluminium"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                    Kategori Produk *
                  </label>
                  <select
                    className="w-full bg-[#F5F1E8] border border-[#D8D2C6] p-2.5 text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Harga (Rp) *"
                  type="number"
                  placeholder="350000"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Jumlah Stok Unit *"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  required
                />
              </div>

              {/* Local File Picker & Auto-Compression Area */}
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                  Foto Produk dari Galeri / Lokal (Wajib &amp; Auto-Kompres) *
                </label>

                <div className="border-2 border-dashed border-[#D8D2C6] hover:border-[#171717] p-5 text-center bg-[#F5F1E8] transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 bg-[#FAF8F2] border border-[#D8D2C6] rounded-full flex items-center justify-center text-[#171717] group-hover:bg-[#171717] group-hover:text-[#F5F1E8] transition-colors">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider">
                        Pilih Foto dari Galeri / Perangkat
                      </p>
                      <p className="font-mono text-[10px] text-[#6B675F] mt-0.5">
                        JPG, PNG, WEBP • Otomatis dikompres sebelum upload ke Supabase Storage
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compression Progress & Preview */}
                {isCompressing && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
                    <span>Mengompresi resolusi &amp; ukuran gambar...</span>
                  </div>
                )}

                {imagePreview && (
                  <div className="p-3 border border-[#D8D2C6] bg-[#FAF8F2] flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={imagePreview}
                        alt="Pratinjau Produk"
                        className="w-14 h-14 object-cover border border-[#D8D2C6] shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-[#171717] block truncate">
                          {selectedImageFile?.name || 'Foto Produk Terpilih'}
                        </span>
                        {compressionStats && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                              ✓ Terkompres (-{compressionStats.savingsPercent}%)
                            </span>
                            <span className="text-[10px] text-[#6B675F]">
                              {compressionStats.originalFormatted} → {compressionStats.compressedFormatted}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-[#F4512A] tracking-wider shrink-0">
                      [Siap Upload]
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                  Deskripsi &amp; Spesifikasi Objek
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-[#F5F1E8] border border-[#D8D2C6] p-3 text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="Material, dimensi teknis, garansi produk..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  className="accent-[#171717]"
                />
                <label htmlFor="featured" className="font-mono text-xs text-[#171717] cursor-pointer">
                  Tampilkan sebagai Produk Unggulan (*Featured*)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#D8D2C6]">
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </Button>
                <Button fullWidth type="submit" disabled={isCompressing}>
                  {isCompressing ? 'Mengompresi Gambar...' : 'Tambahkan Produk →'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUK */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#FAF8F2] border border-[#D8D2C6] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#D8D2C6] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
                  [Sunting Produk]
                </span>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
                  Edit Objek Katalog
                </h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#6B675F] hover:text-[#171717]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <Input
                label="Nama Produk *"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                    Kategori Produk
                  </label>
                  <select
                    className="w-full bg-[#F5F1E8] border border-[#D8D2C6] p-2.5 text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Harga (Rp) *"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Stok Unit *"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  required
                />
              </div>

              {/* Edit Image Area */}
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                  Ubah Foto Produk dari Galeri (Auto-Kompres)
                </label>

                <div className="border-2 border-dashed border-[#D8D2C6] hover:border-[#171717] p-4 text-center bg-[#F5F1E8] transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <UploadCloud className="w-4 h-4 text-[#171717]" />
                    <span className="font-mono text-xs font-bold text-[#171717]">
                      Klik untuk ganti foto dari galeri HP / komputer
                    </span>
                  </div>
                </div>

                {imagePreview && (
                  <div className="p-3 border border-[#D8D2C6] bg-[#FAF8F2] flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Pratinjau"
                        className="w-12 h-12 object-cover border border-[#D8D2C6]"
                      />
                      <div>
                        <span className="font-bold text-[#171717] block">
                          {selectedImageFile ? selectedImageFile.name : 'Gambar saat ini'}
                        </span>
                        {compressionStats && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ✓ {compressionStats.originalFormatted} → {compressionStats.compressedFormatted} (-{compressionStats.savingsPercent}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-[#F5F1E8] border border-[#D8D2C6] p-3 text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#D8D2C6]">
                <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>
                  Batal
                </Button>
                <Button fullWidth type="submit" disabled={isCompressing}>
                  {isCompressing ? 'Mengompresi...' : 'Simpan Perubahan →'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KIRIM PESANAN & INPUT RESI */}
      {isShipModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FAF8F2] border border-[#D8D2C6] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-[#D8D2C6] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
                  [Ekspedisi Logistik]
                </span>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
                  Kirim Pesanan
                </h3>
              </div>
              <button onClick={() => setIsShipModalOpen(false)} className="text-[#6B675F] hover:text-[#171717]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmShipping} className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-[#F5F1E8] border border-[#D8D2C6] space-y-1">
                <p className="text-[#6B675F]">No. Pesanan:</p>
                <p className="font-bold text-[#171717]">{selectedOrder.orderNumber}</p>
                <p className="text-[#6B675F] pt-1">Penerima:</p>
                <p className="font-bold text-[#171717]">{selectedOrder.recipient?.name} ({selectedOrder.recipient?.city})</p>
              </div>

              <Input
                label="Nomor Resi Pengiriman *"
                placeholder="Contoh: JNE889920199 / SICEPAT992"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                required
              />

              <p className="text-[10px] text-[#6B675F]">
                Nomor resi ini akan ditampilkan secara otomatis pada visual tracking pesanan di akun pembeli.
              </p>

              <div className="flex gap-3 pt-4 border-t border-[#D8D2C6]">
                <Button variant="secondary" type="button" onClick={() => setIsShipModalOpen(false)}>
                  Batal
                </Button>
                <Button fullWidth type="submit">
                  Konfirmasi Pengiriman →
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
