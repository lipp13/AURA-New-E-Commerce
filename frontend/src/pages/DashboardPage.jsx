import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Package, User, MapPin, Bell, KeyRound, LogOut, ArrowRight, Store, QrCode } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { OrderTrackingStepper } from '../components/order/OrderTrackingStepper';
import { QRISPaymentModal } from '../components/modals/QRISPaymentModal';

export const DashboardPage = () => {
  const { currentUser, isAuthenticated, logout, updateProfile, updatePassword, openAuthModal, orders, updateOrderStatusLocal } = useAuth();
  const { addToast } = useToast();

  const [tab, setTab] = useState('orders'); // 'orders' | 'profile' | 'addresses' | 'notifications' | 'settings'
  const [isQRISOpen, setIsQRISOpen] = useState(false);
  const [selectedQRISOrder, setSelectedQRISOrder] = useState(null);

  const handleOpenQRISModal = (order) => {
    setSelectedQRISOrder(order);
    setIsQRISOpen(true);
  };

  // Filter orders belonging to the current user
  const userOrders = orders.filter(
    (o) => o.userEmail?.toLowerCase() === (currentUser?.email || '').toLowerCase()
  );

  // Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');
  const [profileCity, setProfileCity] = useState(currentUser?.city || '');
  const [profileCountry, setProfileCountry] = useState(currentUser?.country || '');
  const [profileZip, setProfileZip] = useState(currentUser?.zip || '');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfilePhone(currentUser.phone || '');
      setProfileAddress(currentUser.address || '');
      setProfileCity(currentUser.city || '');
      setProfileCountry(currentUser.country || '');
      setProfileZip(currentUser.zip || '');
    }
  }, [currentUser]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      address: profileAddress,
      city: profileCity,
      country: profileCountry,
      zip: profileZip,
    });
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('Silakan masukkan kata sandi saat ini dan kata sandi baru.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Kata sandi baru harus terdiri dari minimal 6 karakter.', 'error');
      return;
    }
    const res = updatePassword(currentPassword, newPassword);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  // If user is not logged in (Guest State)
  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 max-w-xl mx-auto px-6 text-center space-y-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Sesi Terbatas]
        </span>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-[#171717]">
          Diperlukan Autentikasi
        </h2>
        <p className="font-mono text-xs text-[#6B675F] max-w-sm mx-auto leading-relaxed">
          Silakan masuk ke akun terdaftar Anda untuk memeriksa riwayat pesanan, melacak pengiriman, dan memperbarui data profil.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={() => openAuthModal('login')}>
            Masuk Member
          </Button>
          <Button variant="secondary" onClick={() => openAuthModal('register')}>
            Daftar Akun Baru
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'orders', label: 'Riwayat Pesanan', count: userOrders.length, icon: Package },
    { id: 'profile', label: 'Data Profil', icon: User },
    { id: 'addresses', label: 'Alamat Pengiriman', icon: MapPin },
    { id: 'notifications', label: 'Preferensi', icon: Bell },
    { id: 'settings', label: 'Keamanan & Sandi', icon: KeyRound },
  ];

  return (
    <div className="pt-24 pb-24 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-8">
      <Breadcrumb items={[{ label: 'Dasbor Member' }]} />

      {/* Top Ledger Header */}
      <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-baseline justify-between gap-6">
        <div className="space-y-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B675F] block">
            [Berkas Studio — Member Terverifikasi]
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#171717]">
            {currentUser?.name || 'Member Studio'}
          </h1>
          <p className="font-mono text-xs text-[#6B675F]">
            {currentUser?.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-[#D8D2C6]">
          {/* Quick Access to Seller Portal */}
          {currentUser?.role === 'seller' ? (
            <Link
              to="/seller"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] transition-colors font-bold text-[11px]"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Portal Penjual →</span>
            </Link>
          ) : (
            <Link
              to="/seller/register"
              className="flex items-center gap-1.5 px-3.5 py-2 border border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-[#F5F1E8] transition-colors text-[11px]"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Buka Toko Sendiri</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-rose-700 hover:text-rose-900 border border-rose-700/30 px-3.5 py-2 hover:border-rose-700 transition-colors text-[11px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Horizontal Tab Navigation */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 font-mono text-xs uppercase tracking-wider">
        {tabs.map((item) => {
          const isSelected = tab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-2.5 border whitespace-nowrap flex items-center gap-2 transition-colors ${
                isSelected
                  ? 'bg-[#171717] text-[#F5F1E8] border-[#171717]'
                  : 'bg-[#FAF8F2] border-[#D8D2C6] text-[#171717] hover:border-[#171717]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.count !== undefined && <span>[{item.count}]</span>}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Tabs (Desktop), Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Navigation Sidebar (Desktop Only) */}
        <aside className="hidden lg:block lg:col-span-4 border border-[#D8D2C6] bg-[#FAF8F2] divide-y divide-[#D8D2C6] font-mono text-xs uppercase tracking-widest">
          {tabs.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
                  isSelected
                    ? 'bg-[#171717] text-[#F5F1E8]'
                    : 'text-[#171717] hover:bg-[#ECE6D8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] opacity-60">0{idx + 1}</span>
                  <span className="font-bold">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={isSelected ? 'text-[#F4512A]' : 'text-[#6B675F]'}>
                    [{item.count}]
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="w-full lg:col-span-8 border border-[#D8D2C6] bg-[#FAF8F2] p-6 sm:p-10 space-y-6">
          {/* TAB 1: Orders */}
          {tab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-[#D8D2C6] pb-4">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
                  Pengiriman Tercatat ({userOrders.length})
                </h3>
                <span className="font-mono text-xs text-[#6B675F]">MANIFES PESANAN</span>
              </div>

              {userOrders.length > 0 ? (
                <div className="divide-y divide-[#D8D2C6] border-y border-[#D8D2C6]">
                  {userOrders.map((order) => (
                    <div key={order.id} className="py-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 font-mono text-xs">
                        <div className="flex items-baseline gap-3">
                          <span className="font-bold text-[#171717]">REF: #{order.id}</span>
                          <span className="text-[#6B675F]">• {order.date || 'Tercatat'}</span>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest ${
                          order.status === 'Diproses' || order.status === 'processing'
                            ? 'bg-[#171717] text-[#F5F1E8]'
                            : order.status === 'Dalam Pengiriman' || order.status === 'shipped'
                            ? 'bg-[#F4512A] text-white'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'border border-[#171717] text-[#171717]'
                        }`}>
                          [{order.status}]
                        </span>
                      </div>

                      {/* Visual Order Progress Stepper */}
                      <div className="py-2 border-y border-[#D8D2C6]/60">
                        <OrderTrackingStepper status={order.status} notes={order.tracking || order.notes} />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 font-mono text-xs">
                        <div className="space-y-1">
                          <p className="text-[#171717] font-bold">
                            {Array.isArray(order.items) ? order.items.join(', ') : order.items}
                          </p>
                          {order.tracking && (
                            <p className="text-[#6B675F] text-[11px]">
                              NO. RESI: <strong className="text-[#171717]">{order.tracking}</strong>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-bold text-[#171717]">
                            {formatPrice(order.total)}
                          </span>

                          {order.status?.toLowerCase() === 'pending' && (
                            <button
                              onClick={() => handleOpenQRISModal(order)}
                              className="px-3 py-1.5 bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] transition-colors text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Bayar (QRIS)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-4">
                  <p className="font-mono text-xs text-[#6B675F] uppercase">Belum ada riwayat pesanan tercatat.</p>
                  <Link to="/shop">
                    <Button size="sm">Jelajahi Katalog</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Profile */}
          {tab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="border-b border-[#D8D2C6] pb-4">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
                  Profil Member
                </h3>
                <p className="font-mono text-xs text-[#6B675F]">Perbarui data kontak utama Anda</p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nama Lengkap Resmi"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
                <Input
                  label="Alamat Email Utama"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                />
                <Input
                  label="Nomor Telepon Kontak"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+62 812 3456 7890"
                />
              </div>

              <div className="pt-4 border-t border-[#D8D2C6]">
                <Button type="submit">Simpan Profil</Button>
              </div>
            </form>
          )}

          {/* TAB 3: Addresses */}
          {tab === 'addresses' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="border-b border-[#D8D2C6] pb-4">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
                  Koordinat Pengiriman
                </h3>
                <p className="font-mono text-xs text-[#6B675F]">Alamat tujuan utama untuk pengantaran kurir</p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Alamat Lengkap / Gedung / Nomor"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="Jl. Sudirman No. 28, Suite 402"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Kota"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    placeholder="Jakarta Selatan"
                  />
                  <Input
                    label="Negara"
                    value={profileCountry}
                    onChange={(e) => setProfileCountry(e.target.value)}
                    placeholder="Indonesia"
                  />
                  <Input
                    label="Kode Pos"
                    value={profileZip}
                    onChange={(e) => setProfileZip(e.target.value)}
                    placeholder="12190"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#D8D2C6]">
                <Button type="submit">Simpan Alamat</Button>
              </div>
            </form>
          )}

          {/* TAB 4: Notifications */}
          {tab === 'notifications' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="border-b border-[#D8D2C6] pb-4">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
                  Preferensi Notifikasi
                </h3>
                <p className="font-mono text-xs text-[#6B675F]">Kelola komunikasi otomatis status pesanan</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#171717] w-4 h-4" />
                  <span>Terima pembaruan status pengiriman otomatis via WhatsApp / SMS</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#171717] w-4 h-4" />
                  <span>Terima rilis monograf studio triwulanan &amp; undangan peluncuran privat</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: Settings / Password */}
          {tab === 'settings' && (
            <form onSubmit={handleSavePassword} className="space-y-6">
              <div className="border-b border-[#D8D2C6] pb-4">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
                  Kredensial Keamanan
                </h3>
                <p className="font-mono text-xs text-[#6B675F]">Perbarui kata sandi untuk akun ini</p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Kata Sandi Saat Ini"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="Kata Sandi Baru"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-[#D8D2C6]">
                <Button type="submit">Perbarui Kata Sandi</Button>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* Interactive QRIS Payment Modal for Pending Orders */}
      <QRISPaymentModal
        isOpen={isQRISOpen}
        onClose={() => setIsQRISOpen(false)}
        order={selectedQRISOrder}
        onPaymentSuccess={(updated) => {
          if (selectedQRISOrder?.id) {
            updateOrderStatusLocal(selectedQRISOrder.id, 'processing');
          }
        }}
      />
    </div>
  );
};
