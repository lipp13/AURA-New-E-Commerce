import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register } = useAuth();
  const [mode, setMode] = useState(authModalMode || 'login');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(authModalMode);
    setError('');
  }, [authModalMode, isAuthModalOpen]);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim()) {
      setError('Silakan masukkan alamat email Anda.');
      return;
    }
    if (!loginPassword) {
      setError('Silakan masukkan kata sandi Anda.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!registerName.trim()) {
      setError('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (registerPassword.length < 6) {
      setError('Kata sandi harus terdiri dari minimal 6 karakter.');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword
      });
      if (!res.success) {
        setError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} maxWidth="max-w-md">
      <div className="space-y-6">
        {/* Minimal Tab Switcher */}
        <div className="flex border-b border-[#D8D2C6] pb-3 font-mono text-xs uppercase tracking-widest">
          <button
            onClick={() => handleModeSwitch('login')}
            className={`flex-1 text-left pb-2 transition-colors relative ${
              mode === 'login' ? 'text-[#171717] font-bold' : 'text-[#6B675F] hover:text-[#171717]'
            }`}
          >
            Masuk
            {mode === 'login' && <div className="absolute -bottom-3 left-0 right-0 h-[1.5px] bg-[#F4512A]" />}
          </button>
          <button
            onClick={() => handleModeSwitch('register')}
            className={`flex-1 text-left pb-2 transition-colors relative ${
              mode === 'register' ? 'text-[#171717] font-bold' : 'text-[#6B675F] hover:text-[#171717]'
            }`}
          >
            Buat Akun Baru
            {mode === 'register' && <div className="absolute -bottom-3 left-0 right-0 h-[1.5px] bg-[#F4512A]" />}
          </button>
        </div>

        {error && (
          <div className="p-3 border border-rose-600 bg-rose-50 text-rose-800 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Alamat Email"
              type="email"
              icon={Mail}
              placeholder="nama@domain.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <div className="relative">
              <Input
                label="Kata Sandi"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[34px] text-[#6B675F] hover:text-[#171717]"
                aria-label="Tampilkan sandi"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Masuk ke Akun'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              icon={User}
              placeholder="Contoh: Alex Vance"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
            />

            <Input
              label="Alamat Email"
              type="email"
              icon={Mail}
              placeholder="nama@domain.com"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />

            <div className="relative">
              <Input
                label="Kata Sandi"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Minimal 6 karakter"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[34px] text-[#6B675F] hover:text-[#171717]"
                aria-label="Tampilkan sandi"
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

            <Button fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? 'Mendaftarkan...' : 'Selesaikan Pendaftaran'}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};
