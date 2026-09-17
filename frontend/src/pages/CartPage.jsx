import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { Trash2, Bookmark, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatters';

export const CartPage = () => {
  const {
    cart,
    savedForLater,
    updateQuantity,
    removeFromCart,
    moveToSavedForLater,
    moveToCartFromSaved,
    removeSavedItem,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    shippingFee,
    tax,
    grandTotal,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const res = applyCoupon(couponCode);
    if (res.success) {
      addToast(res.message, 'success');
      setCouponCode('');
    } else {
      addToast(res.message, 'error');
    }
  };

  if (cart.length === 0 && savedForLater.length === 0) {
    return (
      <div className="pt-36 pb-28 max-w-xl mx-auto px-6 text-center space-y-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Keranjang Kosong]
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#171717]">
          Keranjang Belanja Anda Kosong
        </h2>
        <p className="text-xs font-mono text-[#6B675F] max-w-sm mx-auto leading-relaxed">
          Temukan busana fungsional, instrumen akustik, dan perabot hunian pilihan dalam katalog permanen kami.
        </p>
        <div className="pt-4">
          <Link to="/shop">
            <Button size="lg" className="gap-2">
              Jelajahi Katalog Objek <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
      <Breadcrumb items={[{ label: 'Keranjang Belanja' }]} />

      {/* Header */}
      <div className="border-b border-[#D8D2C6] pb-6 flex items-baseline justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
            [Manifes Pesanan]
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#171717] mt-1">
            Keranjang Belanja
          </h1>
        </div>
        <span className="font-mono text-xs text-[#6B675F]">
          {cart.length} OBJEK DALAM KERANJANG
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Cart Ledger */}
        <div className="lg:col-span-7 space-y-10">
          {/* Active Items */}
          <div className="divide-y divide-[#D8D2C6] border-y border-[#D8D2C6]">
            {cart.map((item, idx) => (
              <div key={idx} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                  {/* Framed Image */}
                  <Link to={`/product/${item.product.id}`} className="w-20 h-24 sm:w-24 sm:h-28 bg-[#FAF8F2] border border-[#D8D2C6] flex-shrink-0 overflow-hidden block">
                    <img
                      src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                      alt={item.product.title || ''}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                      }}
                    />
                  </Link>

                  {/* Title & Variants */}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
                      {item.product.brand} / {item.product.category}
                    </span>
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-display text-base font-bold uppercase tracking-tight text-[#171717] hover:text-[#F4512A] transition-colors">
                        {item.product.title}
                      </h3>
                    </Link>

                    <div className="flex gap-4 text-xs font-mono text-[#6B675F] pt-0.5">
                      {item.selectedColor && (
                        <div className="flex items-center gap-1.5">
                          <span>Warna/Material:</span>
                          <span className="w-2.5 h-2.5 border border-[#171717] inline-block" style={{ backgroundColor: item.selectedColor }} />
                        </div>
                      )}
                      {item.selectedSize && <span>Ukuran: {item.selectedSize}</span>}
                    </div>

                    <div className="font-mono text-sm font-bold text-[#171717] pt-1">
                      {formatPrice(item.product.price)}
                    </div>
                  </div>
                </div>

                {/* Right controls: Stepper & Remove */}
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="flex items-center border border-[#D8D2C6] bg-[#FAF8F2]">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                      className="w-8 h-8 flex items-center justify-center font-mono text-xs hover:bg-[#171717] hover:text-white"
                      aria-label="Kurangi jumlah"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-bold text-[#171717]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                      className="w-8 h-8 flex items-center justify-center font-mono text-xs hover:bg-[#171717] hover:text-white"
                      aria-label="Tambah jumlah"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => moveToSavedForLater(item)}
                    className="p-2 text-[#6B675F] hover:text-[#171717] transition-colors"
                    title="Simpan untuk Nanti"
                    aria-label="Simpan untuk Nanti"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                    className="p-2 text-[#6B675F] hover:text-rose-700 transition-colors"
                    title="Hapus dari keranjang"
                    aria-label="Hapus dari keranjang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Saved For Later */}
          {savedForLater.length > 0 && (
            <div className="space-y-4 pt-6">
              <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
                Disimpan untuk Nanti ({savedForLater.length})
              </span>
              <div className="divide-y divide-[#D8D2C6] border-y border-[#D8D2C6]">
                {savedForLater.map((saved, idx) => (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={saved.product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                        alt={saved.product.title || ''}
                        className="w-14 h-16 object-cover border border-[#D8D2C6] bg-[#FAF8F2]"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                        }}
                      />
                      <div>
                        <h4 className="font-display text-sm font-bold text-[#171717] uppercase">{saved.product.title}</h4>
                        <p className="font-mono text-xs text-[#6B675F]">{formatPrice(saved.product.price)}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 font-mono text-xs uppercase">
                      <button onClick={() => moveToCartFromSaved(saved)} className="text-[#171717] hover:text-[#F4512A] font-bold">
                        Pindahkan ke Keranjang
                      </button>
                      <button onClick={() => removeSavedItem(saved)} className="text-rose-700 hover:underline">
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Ledger */}
        <div className="lg:col-span-5 space-y-6 border border-[#D8D2C6] bg-[#FAF8F2] p-8 sticky top-28">
          <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#171717] border-b border-[#D8D2C6] pb-4">
            Ringkasan Finansial
          </h2>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="KODE PROMO (MISAL: AURA10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 bg-[#F5F1E8] border border-[#D8D2C6] text-[#171717] placeholder-[#8A8478] px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider focus:outline-none focus:border-[#171717]"
            />
            <Button type="submit" size="sm" variant="outline">
              Gunakan
            </Button>
          </form>

          {coupon && (
            <div className="flex items-center justify-between p-3 border border-[#D8D2C6] bg-[#F5F1E8] text-xs font-mono">
              <span className="text-[#171717] font-bold">KODE '{coupon.code}' (-{coupon.discountPercentage}%)</span>
              <button onClick={removeCoupon} className="text-rose-700 hover:underline">
                Hapus
              </button>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-3 font-mono text-xs border-b border-[#D8D2C6] pb-6">
            <div className="flex justify-between">
              <span className="text-[#6B675F]">Subtotal</span>
              <span className="text-[#171717] font-bold">{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#F4512A]">
                <span>Diskon Kupon</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#6B675F]">Biaya Pengiriman</span>
              <span>{shippingFee === 0 ? <span className="font-bold text-[#171717]">Bebas Biaya (Gratis)</span> : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B675F]">PPN &amp; Biaya Layanan</span>
              <span className="text-[#171717] font-mono">Sudah Termasuk</span>
            </div>
          </div>

          {/* Total Payable */}
          <div className="flex justify-between items-baseline font-mono">
            <span className="text-xs uppercase tracking-widest text-[#6B675F]">Total Pembayaran</span>
            <span className="text-2xl font-bold text-[#171717]">{formatPrice(grandTotal)}</span>
          </div>

          {/* Checkout CTA */}
          <Button fullWidth size="lg" onClick={() => navigate('/checkout')} className="gap-2">
            Lanjut ke Pembayaran <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] text-center pt-2">
            [Transaksi Terenkripsi SSL 256-Bit]
          </p>
        </div>
      </div>
    </div>
  );
};
