import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, currentUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return (
      <div className="pt-36 pb-28 max-w-lg mx-auto text-center space-y-6 px-6 border border-[#D8D2C6] bg-[#FAF8F2] my-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Member Aktif]
        </span>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-[#171717]">
          Akun Terhubung
        </h2>
        <p className="font-mono text-xs text-[#6B675F]">
          Saat ini terautentikasi sebagai <span className="font-bold text-[#171717]">{currentUser?.name}</span>.
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

    if (!name.trim()) {
      setError('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi harus terdiri dari minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ name, email, password });
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
      <Breadcrumb items={[{ label: 'Pendaftaran Member' }]} />

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 border border-[#D8D2C6] bg-[#FAF8F2]">
        {/* Left Editorial Context */}
        <div className="md:col-span-5 p-8 sm:p-12 border-b md:border-b-0 md:border-r border-[#D8D2C6] flex flex-col justify-between space-y-8 bg-[#F5F1E8]">
          <div className="space-y-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B675F] block">
              [Registri Studio]
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#171717] leading-[1.05]">
              Daftar Akun Baru
            </h1>
            <p className="font-mono text-xs text-[#6B675F] leading-relaxed">
              Buat profil resmi untuk menyimpan alamat pengiriman, menerima undangan akses awal rilis terbatas, dan melacak pesanan.
            </p>
          </div>

          <div className="font-mono text-[11px] text-[#6B675F] space-y-1">
            <p className="text-[#171717] font-bold">[Keistimewaan Member]</p>
            <p>• Bebas biaya kirim reguler &amp; ekspres</p>
            <p>• Pencatatan garansi resmi 2 tahun</p>
            <p>• Kiriman buletin monograf triwulanan</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:col-span-7 p-8 sm:p-12 space-y-6 flex flex-col justify-center">
          <div className="space-y-1 border-b border-[#D8D2C6] pb-4">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#171717]">
              Keanggotaan Baru
            </h2>
            <p className="font-mono text-xs text-[#6B675F]">
              Lengkapi data Anda untuk mengaktifkan akun
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
              label="Nama Lengkap"
              type="text"
              icon={User}
              placeholder="Contoh: Alex Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
                placeholder="Minimal 6 karakter"
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

            <Input
              label="Konfirmasi Kata Sandi"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="Ulangi kata sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="pt-2">
              <Button fullWidth size="lg" type="submit" disabled={loading}>
                {loading ? 'Membuat Akun...' : 'Selesaikan Pendaftaran'}
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#D8D2C6] flex justify-between font-mono text-xs">
            <span className="text-[#6B675F]">Sudah memiliki akun?</span>
            <Link to="/login" className="text-[#171717] hover:text-[#F4512A] underline uppercase tracking-wider">
              Masuk di Sini →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
