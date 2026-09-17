import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in
  if (isAuthenticated) {
    return (
      <div className="pt-36 pb-28 max-w-lg mx-auto text-center space-y-6 px-6 border border-[#D8D2C6] bg-[#FAF8F2] my-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Sesi Aktif]
        </span>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-[#171717]">
          Terotentikasi
        </h2>
        <p className="font-mono text-xs text-[#6B675F]">
          Masuk sebagai <span className="font-bold text-[#171717]">{currentUser?.name}</span> ({currentUser?.email}).
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={() => navigate('/dashboard')}>
            Buka Dasbor
          </Button>
          <Button variant="outline" onClick={() => navigate('/shop')}>
            Kembali ke Toko
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Silakan masukkan alamat email Anda.');
      return;
    }
    if (!password) {
      setError('Silakan masukkan kata sandi Anda.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-24 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-10">
      <Breadcrumb items={[{ label: 'Masuk Member' }]} />

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 border border-[#D8D2C6] bg-[#FAF8F2]">
        {/* Left Side Editorial Context */}
        <div className="md:col-span-5 p-8 sm:p-12 border-b md:border-b-0 md:border-r border-[#D8D2C6] flex flex-col justify-between space-y-8 bg-[#F5F1E8]">
          <div className="space-y-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B675F] block">
              [Registri Studio]
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#171717] leading-[1.05]">
              Autentikasi Member
            </h1>
            <p className="font-mono text-xs text-[#6B675F] leading-relaxed">
              Akses manifes pesanan Anda, rilis katalog privat, dan koordinat pengiriman tersimpan secara terintegrasi.
            </p>
          </div>

          <div className="font-mono text-[11px] text-[#6B675F] space-y-1.5 border-t border-[#D8D2C6] pt-6">
            <p className="text-[#171717] font-bold uppercase tracking-wider">[Layanan Anggota]</p>
            <p>• Pelacakan pengiriman kurir real-time</p>
            <p>• Garansi resmi studio tersinkronisasi</p>
            <p>• Keamanan transaksi terenkripsi SSL</p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:col-span-7 p-8 sm:p-12 space-y-6 flex flex-col justify-center">
          <div className="space-y-1 border-b border-[#D8D2C6] pb-4">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#171717]">
              Masuk
            </h2>
            <p className="font-mono text-xs text-[#6B675F]">
              Masukkan email dan kata sandi untuk melanjutkan
            </p>
          </div>

          {error && (
            <div className="p-3 border border-rose-600 bg-rose-50 text-rose-800 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Alamat Email"
              type="email"
              icon={Mail}
              placeholder="nama@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <Input
                label="Kata Sandi"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[34px] text-[#6B675F] hover:text-[#171717]"
                aria-label="Tampilkan kata sandi"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2">
              <Button fullWidth size="lg" type="submit" disabled={loading}>
                {loading ? 'Memverifikasi...' : 'Masuk ke Akun'}
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#D8D2C6] flex justify-between font-mono text-xs">
            <span className="text-[#6B675F]">Belum memiliki akun?</span>
            <Link to="/register" className="text-[#171717] hover:text-[#F4512A] underline uppercase tracking-wider">
              Daftar di Sini →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
