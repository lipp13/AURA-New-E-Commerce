import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { CreditCard, Landmark, Wallet, Truck, Check, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatPrice } from '../utils/formatters';

export const CheckoutPage = () => {
  const { cart, grandTotal, clearCart } = useCart();
  const { currentUser, isAuthenticated, openAuthModal, addOrder } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review, 4: Success
  const [completedOrder, setCompletedOrder] = useState(null);

  // Form State
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    zip: '',
  });

  useEffect(() => {
    if (currentUser) {
      const parts = (currentUser.name || '').split(' ');
      setShippingData({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        country: currentUser.country || 'Indonesia',
        zip: currentUser.zip || '',
      });
    }
  }, [currentUser]);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expDate: '',
    cvv: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const itemSummaries = cart.map(item => `${item.product.title} (${item.quantity}x)`);

      const createdOrder = await addOrder({
        total: grandTotal,
        items: itemSummaries,
        userEmail: shippingData.email,
        shippingData: shippingData,
        paymentMethod: paymentMethod,
      });

      setCompletedOrder(createdOrder);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setStep(4);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="pt-36 pb-28 max-w-md mx-auto text-center space-y-4 px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Tidak Ada Sesi]
        </span>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#171717]">
          Tidak Ada Sesi Pembayaran Aktif
        </h2>
        <div className="pt-2">
          <Button onClick={() => navigate('/shop')}>Kembali ke Katalog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-4xl mx-auto px-6 sm:px-8 space-y-12">
      <Breadcrumb items={[{ label: 'Pembayaran' }]} />

      {/* Step Progression Bar */}
      {step !== 4 && (
        <div className="flex items-center justify-between border-b border-[#D8D2C6] pb-6 font-mono text-[11px] sm:text-xs uppercase tracking-widest overflow-x-auto no-scrollbar gap-2">
          <span className={`whitespace-nowrap ${step >= 1 ? 'text-[#171717] font-bold' : 'text-[#6B675F]'}`}>
            01. Alamat Pengiriman
          </span>
          <span className="text-[#D8D2C6]">/</span>
          <span className={`whitespace-nowrap ${step >= 2 ? 'text-[#171717] font-bold' : 'text-[#6B675F]'}`}>
            02. Metode Pembayaran
          </span>
          <span className="text-[#D8D2C6]">/</span>
          <span className={`whitespace-nowrap ${step >= 3 ? 'text-[#171717] font-bold' : 'text-[#6B675F]'}`}>
            03. Tinjauan Akhir
          </span>
        </div>
      )}

      {/* STEP 1: Shipping Details */}
      {step === 1 && (
        <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-12 space-y-8">
          <div className="flex items-baseline justify-between border-b border-[#D8D2C6] pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">[Langkah 01]</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#171717]">
                Tujuan &amp; Kontak Pengiriman
              </h2>
            </div>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="font-mono text-xs uppercase tracking-widest text-[#F4512A] hover:underline flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>Masuk Member</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nama Depan" name="firstName" value={shippingData.firstName} onChange={handleInputChange} placeholder="Nama depan Anda" />
              <Input label="Nama Belakang" name="lastName" value={shippingData.lastName} onChange={handleInputChange} placeholder="Nama belakang Anda" />
            </div>

            <Input label="Alamat Email" type="email" name="email" value={shippingData.email} onChange={handleInputChange} placeholder="nama@domain.com" />
            <Input label="Alamat Lengkap" name="address" value={shippingData.address} onChange={handleInputChange} placeholder="Nama Jalan, Gedung, atau Nomor Rumah" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Kota" name="city" value={shippingData.city} onChange={handleInputChange} placeholder="Kota domisili" />
              <Input label="Negara" name="country" value={shippingData.country} onChange={handleInputChange} placeholder="Indonesia" />
              <Input label="Kode Pos" name="zip" value={shippingData.zip} onChange={handleInputChange} placeholder="Kode pos" />
            </div>
          </div>

          <div className="pt-4 border-t border-[#D8D2C6]">
            <Button fullWidth size="lg" onClick={() => setStep(2)}>
              Lanjut ke Metode Pembayaran →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Payment Method */}
      {step === 2 && (
        <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-12 space-y-8">
          <div className="border-b border-[#D8D2C6] pb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">[Langkah 02]</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#171717]">
              Pilih Metode Pembayaran
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs uppercase">
            {[
              { id: 'card', name: 'Kartu Kredit/Debit', icon: CreditCard },
              { id: 'bank', name: 'Transfer Bank', icon: Landmark },
              { id: 'cod', name: 'Bayar di Tempat (COD)', icon: Truck },
              { id: 'ewallet', name: 'Dompet Digital / QRIS', icon: Wallet },
            ].map(method => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 border text-left transition-colors space-y-2 ${
                    paymentMethod === method.id
                      ? 'bg-[#171717] text-[#F5F1E8] border-[#171717]'
                      : 'border-[#D8D2C6] bg-[#F5F1E8] text-[#171717] hover:border-[#171717]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <p className="font-bold tracking-wider">{method.name}</p>
                </button>
              );
            })}
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-4 pt-2 border-t border-[#D8D2C6]">
              <Input label="Nomor Kartu" placeholder="1234 5678 9012 3456" value={cardData.cardNumber} onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Masa Berlaku (Bulan/Tahun)" placeholder="MM/YY" value={cardData.expDate} onChange={(e) => setCardData({...cardData, expDate: e.target.value})} />
                <Input label="Kode Keamanan CVV" placeholder="123" value={cardData.cvv} onChange={(e) => setCardData({...cardData, cvv: e.target.value})} />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-[#D8D2C6]">
            <Button variant="secondary" onClick={() => setStep(1)}>
              ← Kembali
            </Button>
            <Button fullWidth onClick={() => setStep(3)}>
              Lanjut ke Tinjauan Akhir →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Order Review */}
      {step === 3 && (
        <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-12 space-y-8">
          <div className="border-b border-[#D8D2C6] pb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">[Langkah 03]</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#171717]">
              Tinjauan Akhir Pesanan
            </h2>
          </div>

          {/* Shipping & Payment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 border border-[#D8D2C6] bg-[#F5F1E8] font-mono text-xs">
            <div>
              <span className="text-[#6B675F] uppercase tracking-widest block mb-1">[Dikirim Kepada]</span>
              <p className="font-bold text-[#171717]">{shippingData.firstName} {shippingData.lastName}</p>
              <p className="text-[#6B675F]">{shippingData.address}, {shippingData.city}</p>
              <p className="text-[#6B675F]">{shippingData.country} ({shippingData.zip})</p>
            </div>

            <div>
              <span className="text-[#6B675F] uppercase tracking-widest block mb-1">[Metode Pembayaran]</span>
              <p className="font-bold uppercase text-[#171717]">{paymentMethod}</p>
              <p className="text-[#6B675F]">Akun: {shippingData.email}</p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="divide-y divide-[#D8D2C6] border-y border-[#D8D2C6] py-2 font-mono text-xs">
            {cart.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <span>{item.quantity}x {item.product.title}</span>
                <span className="font-bold text-[#171717]">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-baseline font-mono border-b border-[#D8D2C6] pb-4">
            <span className="text-xs uppercase tracking-widest text-[#6B675F]">Total Pembayaran</span>
            <span className="text-2xl font-bold text-[#171717]">{formatPrice(grandTotal)}</span>
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setStep(2)} disabled={isSubmitting}>
              ← Kembali
            </Button>
            <Button fullWidth size="lg" onClick={handlePlaceOrder} loading={isSubmitting} disabled={isSubmitting}>
              Otorisasi &amp; Bayar Pesanan {formatPrice(grandTotal)}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Order Confirmed Receipt */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-14 space-y-8 text-center">
          <div className="w-12 h-12 border border-[#171717] bg-[#171717] text-[#F5F1E8] flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 text-[#F4512A]" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F4512A] font-bold block">
              [Pesanan Berhasil Dikonfirmasi]
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#171717]">
              Bukti Pembayaran #{completedOrder?.id || ''}
            </h2>
            <p className="font-mono text-xs text-[#6B675F] max-w-md mx-auto leading-relaxed pt-2">
              Konfirmasi pesanan dan rincian pengiriman telah dicatat untuk <span className="text-[#171717] font-bold">{shippingData.email}</span>.
            </p>
          </div>

          <div className="p-6 border border-[#D8D2C6] bg-[#F5F1E8] font-mono text-xs space-y-2 text-left">
            <div className="flex justify-between border-b border-[#D8D2C6] pb-2">
              <span className="text-[#6B675F]">NOMOR REFERENSI PESANAN:</span>
              <span className="font-bold text-[#171717]">{completedOrder?.id}</span>
            </div>
            <div className="flex justify-between border-b border-[#D8D2C6] pb-2">
              <span className="text-[#6B675F]">NOMOR RESI PENGIRIMAN:</span>
              <span className="font-bold text-[#171717]">{completedOrder?.tracking}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#6B675F]">ESTIMASI PENGANTARAN:</span>
              <span className="text-[#171717]">2–3 Hari Kerja</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button fullWidth onClick={() => navigate('/dashboard')}>
              Lacak di Dasbor Akun
            </Button>
            <Button variant="outline" fullWidth onClick={() => navigate('/shop')}>
              Lanjutkan Belanja
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
