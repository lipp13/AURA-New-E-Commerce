import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  CreditCard,
  Landmark,
  Wallet,
  Truck,
  Check,
  User,
  QrCode,
  AlertCircle,
  Clock,
  Copy,
  Sparkles,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatPrice } from '../utils/formatters';
import { QRISPaymentModal } from '../components/modals/QRISPaymentModal';
import { INDONESIA_LOCATIONS } from '../data/indonesiaLocations';

const QRIS_ADMIN_FEE = 2500;

export const CheckoutPage = () => {
  const { cart, grandTotal, clearCart, subtotal, shippingFee, discountAmount } = useCart();
  const { currentUser, isAuthenticated, openAuthModal, addOrder } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review, 4: Success
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isQRISModalOpen, setIsQRISModalOpen] = useState(false);
  const [shippingErrors, setShippingErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});

  // Form State: Shipping
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: 'Jakarta Selatan',
    district: 'Kebayoran Baru',
    address: '',
    country: 'Indonesia',
    zip: '12110',
  });

  // Current available districts based on selected city
  const selectedCityObj = INDONESIA_LOCATIONS.find((loc) => loc.city === shippingData.city) || INDONESIA_LOCATIONS[0];
  const availableDistricts = selectedCityObj?.districts || [];

  useEffect(() => {
    if (currentUser) {
      const parts = (currentUser.name || '').trim().split(' ');
      const userCity = currentUser.city || 'Jakarta Selatan';
      const cityMatch = INDONESIA_LOCATIONS.find(
        (l) => l.city.toLowerCase() === userCity.toLowerCase()
      ) || INDONESIA_LOCATIONS[0];

      const userDistrict = cityMatch.districts[0]?.name || 'Kebayoran Baru';
      const defaultZip = cityMatch.districts[0]?.postalCode || '12110';

      setShippingData({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: cityMatch.city,
        district: userDistrict,
        country: 'Indonesia',
        zip: currentUser.zip || defaultZip,
      });
    }
  }, [currentUser]);

  // Handle City Change: Auto update districts and default postal code
  const handleCityChange = (cityName) => {
    const cityObj = INDONESIA_LOCATIONS.find((loc) => loc.city === cityName) || INDONESIA_LOCATIONS[0];
    const firstDistrict = cityObj.districts[0] || { name: '', postalCode: '' };

    setShippingData((prev) => ({
      ...prev,
      city: cityName,
      district: firstDistrict.name,
      zip: firstDistrict.postalCode || prev.zip,
    }));

    if (shippingErrors.city) {
      setShippingErrors((prev) => ({ ...prev, city: null, district: null, zip: null }));
    }
  };

  // Handle District Change: Auto update postal code
  const handleDistrictChange = (districtName) => {
    const foundDistrict = availableDistricts.find((d) => d.name === districtName);
    const newZip = foundDistrict?.postalCode || '';

    setShippingData((prev) => ({
      ...prev,
      district: districtName,
      zip: newZip || prev.zip,
    }));

    if (shippingErrors.district) {
      setShippingErrors((prev) => ({ ...prev, district: null, zip: null }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({ ...prev, [name]: value }));
    if (shippingErrors[name]) {
      setShippingErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Payment Method States
  const [paymentMethod, setPaymentMethod] = useState('qris'); // 'qris' | 'bank' | 'card' | 'cod'
  const [selectedBank, setSelectedBank] = useState('BCA');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expDate: '',
    cvv: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Total Calculations including QRIS admin fee
  const currentAdminFee = paymentMethod === 'qris' ? QRIS_ADMIN_FEE : 0;
  const finalPayableTotal = grandTotal + currentAdminFee;

  // Validation for Step 1: Shipping Details
  const validateShippingForm = () => {
    const errors = {};
    if (!shippingData.firstName.trim()) errors.firstName = 'Nama depan wajib diisi.';
    if (!shippingData.lastName.trim()) errors.lastName = 'Nama belakang wajib diisi.';
    if (!shippingData.email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(shippingData.email)) {
      errors.email = 'Format email tidak valid.';
    }
    if (!shippingData.phone.trim()) {
      errors.phone = 'Nomor WhatsApp / HP wajib diisi.';
    } else if (!/^[0-9+ -]{8,18}$/.test(shippingData.phone.trim())) {
      errors.phone = 'Format nomor HP tidak valid (contoh: 08123456789).';
    }
    if (!shippingData.city) errors.city = 'Kota tujuan wajib dipilih.';
    if (!shippingData.district) errors.district = 'Daerah / Kecamatan wajib dipilih.';
    if (!shippingData.address.trim()) errors.address = 'Alamat lengkap pengiriman wajib diisi.';
    if (!shippingData.zip.trim()) errors.zip = 'Kode pos wajib diisi.';

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoToPayment = () => {
    if (!validateShippingForm()) {
      addToast('Harap isi semua kolom alamat & kontak pengiriman dengan lengkap.', 'error');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validation for Step 2: Payment Details
  const validatePaymentForm = () => {
    const errors = {};
    if (paymentMethod === 'card') {
      const cleanNum = cardData.cardNumber.replace(/\s+/g, '');
      if (!cleanNum || cleanNum.length < 15) {
        errors.cardNumber = 'Nomor kartu harus terdiri dari 15-16 digit.';
      }
      if (!cardData.expDate || !/^\d{2}\/\d{2}$/.test(cardData.expDate)) {
        errors.expDate = 'Format masa berlaku harus MM/YY (contoh: 08/28).';
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        errors.cvv = 'Kode CVV harus 3 digit.';
      }
    } else if (paymentMethod === 'bank') {
      if (!selectedBank) {
        errors.bank = 'Pilih salah satu rekening bank tujuan transfer.';
      }
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoToReview = () => {
    if (!validatePaymentForm()) {
      addToast('Harap lengkapi detail informasi pembayaran yang dipilih.', 'error');
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Place Order Handler
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const itemSummaries = cart.map((item) => `${item.product.title} (${item.quantity}x)`);

      const createdOrder = await addOrder({
        total: finalPayableTotal,
        subtotal: subtotal,
        shippingCost: shippingFee,
        adminFee: currentAdminFee,
        items: itemSummaries,
        userEmail: shippingData.email,
        shippingData: {
          ...shippingData,
          name: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
          fullLocation: `${shippingData.district}, ${shippingData.city} ${shippingData.zip}`,
        },
        paymentMethod: paymentMethod,
        bankName: paymentMethod === 'bank' ? selectedBank : null,
      });

      setCompletedOrder(createdOrder);

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      setStep(4);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      addToast(err.message || 'Gagal memproses pesanan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyBill = () => {
    navigator.clipboard.writeText(finalPayableTotal.toString());
    setCopiedAmount(true);
    addToast('Total tagihan disalin ke clipboard.', 'success');
    setTimeout(() => setCopiedAmount(false), 2000);
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
        <p className="font-mono text-xs text-[#6B675F]">
          Keranjang belanja Anda kosong. Silakan pilih objek kurasi kami terlebih dahulu.
        </p>
        <div className="pt-2">
          <Button onClick={() => navigate('/shop')}>Kembali ke Katalog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-4xl mx-auto px-6 sm:px-8 space-y-12">
      <Breadcrumb items={[{ label: 'Pembayaran & Checkout' }]} />

      {/* Step Progression Bar */}
      {step !== 4 && (
        <div className="flex items-center justify-between border-b border-[#D8D2C6] pb-6 font-mono text-[11px] sm:text-xs uppercase tracking-widest overflow-x-auto no-scrollbar gap-2">
          <span className={`whitespace-nowrap ${step >= 1 ? 'text-[#171717] font-bold' : 'text-[#6B675F]'}`}>
            01. Alamat &amp; Daerah
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

      {/* STEP 1: Shipping Details & Location Selection */}
      {step === 1 && (
        <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-12 space-y-8">
          <div className="flex items-baseline justify-between border-b border-[#D8D2C6] pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
                [Langkah 01 • Semua Kolom Wajib Diisi]
              </span>
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

          {Object.keys(shippingErrors).length > 0 && (
            <div className="p-4 border border-rose-300 bg-rose-50 text-rose-800 font-mono text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Harap lengkapi semua kolom yang bertanda bintang (*):</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {Object.values(shippingErrors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Nama Depan *"
                  name="firstName"
                  value={shippingData.firstName}
                  onChange={handleInputChange}
                  placeholder="Nama depan Anda"
                  required
                />
                {shippingErrors.firstName && (
                  <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {shippingErrors.firstName}</p>
                )}
              </div>
              <div>
                <Input
                  label="Nama Belakang *"
                  name="lastName"
                  value={shippingData.lastName}
                  onChange={handleInputChange}
                  placeholder="Nama belakang Anda"
                  required
                />
                {shippingErrors.lastName && (
                  <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {shippingErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Alamat Email *"
                  type="email"
                  name="email"
                  value={shippingData.email}
                  onChange={handleInputChange}
                  placeholder="nama@domain.com"
                  required
                />
                {shippingErrors.email && (
                  <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {shippingErrors.email}</p>
                )}
              </div>
              <div>
                <Input
                  label="Nomor WhatsApp / HP *"
                  name="phone"
                  value={shippingData.phone}
                  onChange={handleInputChange}
                  placeholder="08123456789"
                  required
                />
                {shippingErrors.phone && (
                  <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {shippingErrors.phone}</p>
                )}
              </div>
            </div>

            {/* City, District & Auto Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* City Selection */}
              <div className="space-y-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                  Kota Tujuan *
                </label>
                <select
                  value={shippingData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-[#F5F1E8] border border-[#D8D2C6] p-2.5 text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
                  required
                >
                  {INDONESIA_LOCATIONS.map((loc) => (
                    <option key={loc.city} value={loc.city}>
                      {loc.city} ({loc.province})
                    </option>
                  ))}
                </select>
                {shippingErrors.city && (
                  <p className="font-mono text-[11px] text-rose-600">⚠ {shippingErrors.city}</p>
                )}
              </div>

              {/* District Selection */}
              <div className="space-y-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                  Daerah / Kecamatan *
                </label>
                <select
                  value={shippingData.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-[#F5F1E8] border border-[#D8D2C6] p-2.5 text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
                  required
                >
                  {availableDistricts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} {d.postalCode ? `(${d.postalCode})` : ''}
                    </option>
                  ))}
                </select>
                {shippingErrors.district && (
                  <p className="font-mono text-[11px] text-rose-600">⚠ {shippingErrors.district}</p>
                )}
              </div>

              {/* Auto Postal Code */}
              <div>
                <Input
                  label="Kode Pos (Otomatis) *"
                  name="zip"
                  value={shippingData.zip}
                  onChange={handleInputChange}
                  placeholder="Kode pos"
                  required
                />
                {shippingErrors.zip && (
                  <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {shippingErrors.zip}</p>
                )}
              </div>
            </div>

            {/* Full Street Address */}
            <div>
              <Input
                label="Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Patokan) *"
                name="address"
                value={shippingData.address}
                onChange={handleInputChange}
                placeholder="Contoh: Jl. Senopati No. 42, RT 02/RW 04"
                required
              />
              {shippingErrors.address && (
                <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {shippingErrors.address}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#D8D2C6]">
            <Button fullWidth size="lg" onClick={handleGoToPayment}>
              Lanjut ke Metode Pembayaran →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Payment Method Selection & Forms */}
      {step === 2 && (
        <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-12 space-y-8">
          <div className="border-b border-[#D8D2C6] pb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
              [Langkah 02 • Lengkapi Detail Pembayaran]
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#171717]">
              Pilih Metode Pembayaran
            </h2>
          </div>

          {Object.keys(paymentErrors).length > 0 && (
            <div className="p-4 border border-rose-300 bg-rose-50 text-rose-800 font-mono text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Harap lengkapi detail metode pembayaran:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {Object.values(paymentErrors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Payment Method Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs uppercase">
            {[
              {
                id: 'qris',
                name: 'QRIS Instant',
                sub: '+ Biaya Admin Rp 2.500',
                badge: 'Rekomendasi',
                icon: QrCode,
              },
              {
                id: 'bank',
                name: 'Transfer Bank',
                sub: 'BCA / Mandiri / BNI / BRI',
                icon: Landmark,
              },
              {
                id: 'card',
                name: 'Kartu Kredit/Debit',
                sub: 'Visa / Mastercard',
                icon: CreditCard,
              },
              {
                id: 'cod',
                name: 'Bayar di Tempat',
                sub: 'COD Ekspedisi',
                icon: Truck,
              },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method.id);
                    setPaymentErrors({});
                  }}
                  className={`p-4 border text-left transition-colors relative space-y-2 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#171717] text-[#F5F1E8] border-[#171717]'
                      : 'border-[#D8D2C6] bg-[#F5F1E8] text-[#171717] hover:border-[#171717]'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <Icon className="w-5 h-5" />
                    {method.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase ${
                        isSelected ? 'bg-[#F4512A] text-white' : 'bg-[#171717] text-[#F5F1E8]'
                      }`}>
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold tracking-wider">{method.name}</p>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#D8D2C6]' : 'text-[#6B675F]'}`}>
                      {method.sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* METHOD 1: QRIS Info Banner */}
          {paymentMethod === 'qris' && (
            <div className="p-5 border border-[#D8D2C6] bg-[#F5F1E8] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#D8D2C6] pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <strong className="text-[#171717] uppercase">QRIS Merchant Resmi: ayya</strong>
                </div>
                <span className="text-[10px] text-[#6B675F]">NMID: ID1026497930317</span>
              </div>
              <p className="text-[#6B675F] leading-relaxed">
                Pembayaran dapat dipindai melalui aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau Dompet Digital (GoPay, OVO, Dana, ShopeePay).
              </p>
              <div className="p-3 bg-white border border-[#D8D2C6] flex items-center justify-between">
                <span className="text-[#6B675F]">Biaya Admin QRIS:</span>
                <span className="font-bold text-[#171717]">+ {formatPrice(QRIS_ADMIN_FEE)}</span>
              </div>
            </div>
          )}

          {/* METHOD 2: Bank Transfer Selection */}
          {paymentMethod === 'bank' && (
            <div className="space-y-4 pt-2 border-t border-[#D8D2C6]">
              <label className="font-mono text-xs uppercase tracking-wider text-[#171717] block">
                Pilih Bank Tujuan Transfer *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                {['BCA', 'Mandiri', 'BNI', 'BRI'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`p-3 border text-center font-bold transition-colors ${
                      selectedBank === bank
                        ? 'bg-[#171717] text-[#F5F1E8] border-[#171717]'
                        : 'border-[#D8D2C6] bg-[#F5F1E8] text-[#171717] hover:border-[#171717]'
                    }`}
                  >
                    Bank {bank}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-[#F5F1E8] border border-[#D8D2C6] font-mono text-xs space-y-1">
                <p className="text-[#6B675F]">Nomor Rekening Tujuan:</p>
                <p className="font-bold text-sm text-[#171717]">8830-1928-3019 (PT AURA OBJEK INDONESIA)</p>
                <p className="text-[10px] text-[#6B675F] pt-1">Verifikasi pembayaran otomatis dalam 1–5 menit setelah bukti diunggah.</p>
              </div>
            </div>
          )}

          {/* METHOD 3: Credit Card Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4 pt-2 border-t border-[#D8D2C6]">
              <div>
                <Input
                  label="Nomor Kartu Kredit/Debit (16 Digit) *"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                  required
                />
                {paymentErrors.cardNumber && (
                  <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {paymentErrors.cardNumber}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Masa Berlaku (MM/YY) *"
                    placeholder="08/28"
                    value={cardData.expDate}
                    onChange={(e) => setCardData({ ...cardData, expDate: e.target.value })}
                    required
                  />
                  {paymentErrors.expDate && (
                    <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {paymentErrors.expDate}</p>
                  )}
                </div>
                <div>
                  <Input
                    label="Kode CVV (3 Digit) *"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    required
                  />
                  {paymentErrors.cvv && (
                    <p className="font-mono text-[11px] text-rose-600 mt-1">⚠ {paymentErrors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* METHOD 4: COD Details */}
          {paymentMethod === 'cod' && (
            <div className="p-4 bg-[#F5F1E8] border border-[#D8D2C6] font-mono text-xs space-y-2">
              <strong className="text-[#171717] uppercase block">Ketentuan Bayar di Tempat (COD):</strong>
              <p className="text-[#6B675F] leading-relaxed">
                Siapkan uang pas sesuai total tagihan saat kurir ekspedisi mengantarkan paket ke alamat Anda di{' '}
                <strong className="text-[#171717]">{shippingData.district}, {shippingData.city}</strong>.
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-[#D8D2C6]">
            <Button variant="secondary" onClick={() => setStep(1)}>
              ← Kembali
            </Button>
            <Button fullWidth onClick={handleGoToReview}>
              Lanjut ke Tinjauan Akhir →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Order Review & Transparent Calculations */}
      {step === 3 && (
        <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-12 space-y-8">
          <div className="border-b border-[#D8D2C6] pb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
              [Langkah 03 • Konfirmasi Pesanan]
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#171717]">
              Tinjauan Akhir Pesanan
            </h2>
          </div>

          {/* Destination & Payment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 border border-[#D8D2C6] bg-[#F5F1E8] font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[#6B675F] uppercase tracking-widest block mb-1">
                [Tujuan Pengiriman]
              </span>
              <p className="font-bold text-[#171717]">{shippingData.firstName} {shippingData.lastName}</p>
              <p className="text-[#6B675F]">{shippingData.phone} • {shippingData.email}</p>
              <p className="text-[#171717] pt-1">{shippingData.address}</p>
              <p className="text-[#171717] font-semibold">
                {shippingData.district}, {shippingData.city} ({shippingData.zip})
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[#6B675F] uppercase tracking-widest block mb-1">
                [Metode Pembayaran Terpilih]
              </span>
              <p className="font-bold uppercase text-[#171717]">
                {paymentMethod === 'qris'
                  ? 'QRIS Instant (ayya • NMID: ID1026497930317)'
                  : paymentMethod === 'bank'
                  ? `Transfer Bank (${selectedBank})`
                  : paymentMethod === 'card'
                  ? 'Kartu Kredit / Debit'
                  : 'Bayar di Tempat (COD)'}
              </p>
              <p className="text-[#6B675F]">Akun Pembeli: {shippingData.email}</p>
              <div className="pt-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  ✓ Data Terverifikasi
                </span>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="divide-y divide-[#D8D2C6] border-y border-[#D8D2C6] py-2 font-mono text-xs">
            {cart.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-10 h-10 object-cover border border-[#D8D2C6] bg-white"
                    />
                  )}
                  <div>
                    <span className="font-bold text-[#171717] block">{item.product.title}</span>
                    <span className="text-[#6B675F] text-[11px]">{item.quantity}x @ {formatPrice(item.product.price)}</span>
                  </div>
                </div>
                <span className="font-bold text-[#171717]">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Price Breakdown Calculation */}
          <div className="space-y-2 font-mono text-xs border-b border-[#D8D2C6] pb-4">
            <div className="flex justify-between text-[#6B675F]">
              <span>Subtotal Produk</span>
              <span className="text-[#171717]">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-[#6B675F]">
              <span>Biaya Pengiriman ({shippingData.city})</span>
              <span className="text-[#171717]">
                {shippingFee === 0 ? 'Gratis Ongkir' : formatPrice(shippingFee)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Diskon Kupon</span>
                <span>- {formatPrice(discountAmount)}</span>
              </div>
            )}

            {paymentMethod === 'qris' && (
              <div className="flex justify-between text-[#171717] bg-white p-2.5 border border-[#D8D2C6] font-bold">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#F4512A]" />
                  <span>Biaya Admin Layanan QRIS</span>
                </span>
                <span>+ {formatPrice(QRIS_ADMIN_FEE)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-3 border-t border-[#D8D2C6]">
              <span className="text-xs uppercase tracking-widest text-[#6B675F] font-bold">
                Total Tagihan Akhir
              </span>
              <span className="font-display text-2xl font-extrabold text-[#171717]">
                {formatPrice(finalPayableTotal)}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setStep(2)} disabled={isSubmitting}>
              ← Kembali
            </Button>
            <Button fullWidth size="lg" onClick={handlePlaceOrder} loading={isSubmitting} disabled={isSubmitting}>
              Otorisasi &amp; Bayar Pesanan {formatPrice(finalPayableTotal)} →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Order Confirmed Receipt & QRIS Display */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-14 space-y-8 text-center">
          <div className="w-14 h-14 border border-[#171717] bg-[#171717] text-[#F5F1E8] flex items-center justify-center mx-auto shadow-md">
            <Check className="w-7 h-7 text-[#F4512A]" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F4512A] font-bold block">
              [Pesanan Berhasil Dibuat]
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#171717]">
              Bukti Pesanan #{completedOrder?.id || completedOrder?.orderNumber || 'AURA-ORD'}
            </h2>
            <p className="font-mono text-xs text-[#6B675F] max-w-md mx-auto leading-relaxed pt-1">
              Rincian pesanan telah dicatat untuk <strong className="text-[#171717]">{shippingData.email}</strong> dan dikirim ke alamat{' '}
              <strong className="text-[#171717]">{shippingData.district}, {shippingData.city}</strong>.
            </p>
          </div>

          <div className="p-6 border border-[#D8D2C6] bg-[#F5F1E8] font-mono text-xs space-y-2 text-left">
            <div className="flex justify-between border-b border-[#D8D2C6] pb-2">
              <span className="text-[#6B675F]">NOMOR REFERENSI:</span>
              <span className="font-bold text-[#171717]">{completedOrder?.id || completedOrder?.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-[#D8D2C6] pb-2">
              <span className="text-[#6B675F]">STATUS:</span>
              <span className={`font-bold uppercase ${completedOrder?.status === 'processing' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {completedOrder?.status === 'processing' ? 'Lunas & Dipersiapkan' : 'Menunggu Pembayaran'}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#D8D2C6] pb-2">
              <span className="text-[#6B675F]">METODE:</span>
              <span className="font-bold text-[#171717] uppercase">{paymentMethod}</span>
            </div>
            {paymentMethod === 'qris' && (
              <div className="flex justify-between border-b border-[#D8D2C6] pb-2 text-[#6B675F]">
                <span>BIAYA ADMIN QRIS:</span>
                <span className="font-bold text-[#171717]">{formatPrice(QRIS_ADMIN_FEE)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-[#6B675F]">TOTAL TAGIHAN:</span>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-extrabold text-[#171717]">
                  {formatPrice(finalPayableTotal)}
                </span>
                <button
                  onClick={handleCopyBill}
                  className="text-[#6B675F] hover:text-[#171717] transition-colors"
                  title="Salin nominal"
                >
                  {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* QRIS Authentic Merchant Display Card */}
          {paymentMethod === 'qris' && completedOrder?.status !== 'processing' && (
            <div className="p-6 border-2 border-[#171717] bg-[#FFFFFF] text-left space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#D8D2C6] pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#F4512A]" />
                  <div>
                    <span className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider block">
                      Kode QRIS Merchant Resmi: ayya
                    </span>
                    <span className="font-mono text-[10px] text-[#6B675F]">NMID: ID1026497930317</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 font-bold uppercase">
                  Menunggu Scan
                </span>
              </div>

              {/* Scannable Image from user */}
              <div className="max-w-[260px] mx-auto border border-[#D8D2C6] p-2 bg-white rounded shadow-sm">
                <img
                  src="/qris-real.png"
                  alt="QRIS Pembayaran Resmi - ayya"
                  className="w-full h-auto object-contain mx-auto"
                />
              </div>

              <div className="text-center space-y-1 font-mono text-xs">
                <p className="text-[#6B675F]">
                  Total Tagihan Termasuk Biaya Admin: <strong className="text-[#171717]">{formatPrice(finalPayableTotal)}</strong>
                </p>
                <p className="text-[10px] text-[#6B675F]">
                  Gunakan aplikasi BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay untuk memindai.
                </p>
              </div>

              <button
                onClick={() => setIsQRISModalOpen(true)}
                className="w-full py-3.5 px-4 bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] transition-colors font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow"
              >
                <Sparkles className="w-4 h-4" />
                <span>Buka Modal QRIS &amp; Simulasi Bayar Lunas →</span>
              </button>
            </div>
          )}

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

      {/* QRIS Interactive Payment Modal */}
      <QRISPaymentModal
        isOpen={isQRISModalOpen}
        onClose={() => setIsQRISModalOpen(false)}
        order={completedOrder ? { ...completedOrder, total: finalPayableTotal } : null}
        onPaymentSuccess={(updated) => {
          setCompletedOrder(updated);
        }}
      />
    </div>
  );
};
