// src/pages/SellerOnboardingPage.jsx
// Onboarding page to open a store & upgrade to Seller role in AURA / OBJEK with strict validation

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Store, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SellerOnboardingPage = () => {
  const { currentUser, isAuthenticated, upgradeToSeller, openAuthModal } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState(currentUser?.name ? `Toko ${currentUser.name}` : '');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || currentUser?.city || '');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
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
            Akun Anda sudah memiliki hak akses Seller. Silakan masuk ke Portal Penjual untuk mengelola katalog &amp; pesanan.
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

  const validateForm = () => {
    const errs = {};
    if (!storeName || !storeName.trim()) {
      errs.storeName = 'Nama toko wajib diisi.';
    } else if (storeName.trim().length < 3) {
      errs.storeName = 'Nama toko minimal 3 karakter.';
    }

    if (!description || !description.trim()) {
      errs.description = 'Deskripsi / profil toko wajib diisi.';
    } else if (description.trim().length < 10) {
      errs.description = 'Deskripsi toko minimal 10 karakter.';
    }

    if (!phone || !phone.trim()) {
      errs.phone = 'Nomor telepon / WhatsApp toko wajib diisi.';
    } else if (!/^[0-9+ -]{8,18}$/.test(phone.trim())) {
      errs.phone = 'Format nomor telepon tidak valid (contoh: 08123456789).';
    }

    if (!address || !address.trim()) {
      errs.address = 'Kota / Lokasi operasional toko wajib diisi.';
    }

    if (!agreeTerms) {
      errs.agreeTerms = 'Anda harus menyetujui syarat & ketentuan mitra penjual.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Harap lengkapi semua kolom formulir pendaftaran toko yang wajib diisi.', 'error');
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
        addToast('Selamat! Toko Anda berhasil dibuka dan akun telah menjadi Seller.', 'success');
        navigate('/seller');
      }
    } catch (err) {
      addToast(err.message || 'Gagal mendaftarkan toko.', 'error');
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
                [Formulir Pendaftaran Toko Wajib Diisi Lengkap]
              </span>
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
                Informasi Toko Anda
              </h2>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="p-4 border border-rose-300 bg-rose-50 text-rose-800 font-mono text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Harap lengkapi semua data toko yang diperlukan:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {Object.values(errors).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input
                  label="Nama Toko *"
                  placeholder="Contoh: Studio Objek Nusantara"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    if (errors.storeName) setErrors((prev) => ({ ...prev, storeName: null }));
                  }}
                  required
                />
                {errors.storeName && (
                  <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {errors.storeName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                  Deskripsi / Profil Toko *
                </label>
                <textarea
                  rows={3}
                  className={`w-full bg-[#F5F1E8] border p-3 text-xs font-mono text-[#171717] focus:outline-none transition-colors ${
                    errors.description ? 'border-rose-500 bg-rose-50/30' : 'border-[#D8D2C6] focus:border-[#171717]'
                  }`}
                  placeholder="Jelaskan spesialisasi produk, material pilihan, atau filosofi desain toko Anda..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                  }}
                  required
                />
                {errors.description && (
                  <p className="font-mono text-[11px] text-rose-600">⚠ {errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Nomor WhatsApp / Telepon Toko *"
                    placeholder="Contoh: 08123456789"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                    }}
                    required
                  />
                  {errors.phone && (
                    <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {errors.phone}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Kota / Lokasi Operasional Toko *"
                    placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
                    }}
                    required
                  />
                  {errors.address && (
                    <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {errors.address}</p>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }));
                    }}
                    className="mt-0.5 accent-[#171717] w-4 h-4"
                  />
                  <span className="font-mono text-xs text-[#171717] leading-relaxed">
                    Saya menyatakan data toko di atas benar dan menyetujui seluruh{' '}
                    <strong className="underline">Syarat &amp; Ketentuan Mitra Penjual AURA</strong> serta kewajiban pengiriman tepat waktu. *
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="font-mono text-[11px] text-rose-600 mt-1 pl-7">⚠ {errors.agreeTerms}</p>
                )}
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
