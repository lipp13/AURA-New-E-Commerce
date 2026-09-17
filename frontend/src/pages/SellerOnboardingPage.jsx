// src/pages/SellerOnboardingPage.jsx
// Onboarding page to open a store & upgrade to Seller role in AURA / OBJEK

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Store, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SellerOnboardingPage = () => {
  const { currentUser, isAuthenticated, upgradeToSeller, openAuthModal } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState(`Toko ${currentUser?.name || ''}`);
  const [description, setDescription] = useState('Studio kurasi objek keseharian dan peranti estetik kontemporer.');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already a seller, direct to seller portal
  if (currentUser?.role === 'seller') {
    return (
      <div className="pt-36 pb-28 max-w-xl mx-auto px-6 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-[#FAF8F2] border border-[#D8D2C6] rounded-full flex items-center justify-center text-[#171717]">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">[Status: Penjual Aktif]</span>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#171717]">
            Toko Anda Sudah Terdaftar
          </h2>
          <p className="font-mono text-xs text-[#6B675F]">
            Akun Anda sudah memiliki hak akses Seller. Silakan masuk ke Portal Penjual untuk mengelola katalog & pesanan.
          </p>
        </div>
        <Button onClick={() => navigate('/seller')} fullWidth>
          Buka Portal Penjual →
        </Button>
      </div>
    );
  }

  // If guest, require login first
  if (!isAuthenticated) {
    return (
      <div className="pt-36 pb-28 max-w-xl mx-auto px-6 text-center space-y-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">[Autentikasi Diperlukan]</span>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#171717]">
          Buka Toko di AURA / OBJEK
        </h2>
        <p className="font-mono text-xs text-[#6B675F]">
          Silakan masuk atau daftarkan akun pembeli Anda terlebih dahulu sebelum mengaktifkan profil toko Anda.
        </p>
        <Button onClick={() => openAuthModal('login')}>
          Masuk ke Akun Anda
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      addToast('Nama toko wajib diisi.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await upgradeToSeller({
        store_name: storeName.trim(),
        description: description.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      if (res.success) {
        navigate('/seller');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
      <Breadcrumb
        items={[
          { label: 'Beranda', path: '/' },
          { label: 'Buka Toko', path: '/seller/register' },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Editorial Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-[#D8D2C6] pb-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block mb-2">
              [Program Kurasi Mitra]
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#171717]">
              Buka Toko &amp; Jual Objek Anda
            </h1>
            <p className="font-mono text-xs text-[#6B675F] mt-4 leading-relaxed">
              Bergabunglah dengan ekosistem AURA. Sajikan karya desain, peranti industri, atau objek keseharian Anda kepada ribuan penikmat estetika kontemporer.
            </p>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 border border-[#D8D2C6] bg-[#FAF8F2] flex items-start gap-3">
              <Store className="w-5 h-5 text-[#F4512A] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#171717] uppercase tracking-wider mb-1">Katalog Mandiri</strong>
                <p className="text-[#6B675F]">Kelola produk, atur stok, deskripsi material, dan foto produk dengan sistem manajemen independen.</p>
              </div>
            </div>

            <div className="p-4 border border-[#D8D2C6] bg-[#FAF8F2] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#171717] uppercase tracking-wider mb-1">Transaksi Terverifikasi</strong>
                <p className="text-[#6B675F]">Semua transaksi pembayaran QRIS dan Transfer diamankan secara otomatis oleh platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7">
          <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-10 shadow-sm space-y-6">
            <div className="border-b border-[#D8D2C6] pb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
                [Formulir Pendaftaran Toko]
              </span>
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
                Informasi Toko Anda
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nama Toko *"
                placeholder="Contoh: Studio Objek Nusantara"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                  Deskripsi / Profil Toko
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-[#F5F1E8] border border-[#D8D2C6] p-3 text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717] transition-colors"
                  placeholder="Jelaskan spesialisasi produk atau filosofi desain toko Anda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nomor Telepon / WhatsApp"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Kota / Lokasi Toko"
                  placeholder="Jakarta Selatan"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-[#D8D2C6]">
                <Button fullWidth type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Memproses Pendaftaran Toko...' : 'Aktifkan Toko & Masuk ke Portal Penjual →'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
