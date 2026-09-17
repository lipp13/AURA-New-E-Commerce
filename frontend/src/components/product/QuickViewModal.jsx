import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  const fallbackImg = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80';
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : [fallbackImg]);

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : null);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const isFavorite = isInWishlist(product.id);

  const handleAdd = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    addToast(`Berhasil menambahkan ${quantity}x "${product.title}" ke keranjang`, 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="max-h-[75vh] md:max-h-none overflow-y-auto md:overflow-visible pr-1 md:pr-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Left: Framed Gallery */}
          <div className="md:col-span-6 space-y-3">
            <div className="aspect-[4/5] bg-[#ECE6D8] border border-[#D8D2C6] overflow-hidden">
              <img
                src={images[selectedImg] || images[0]}
                alt={product.title || 'Product'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImg;
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`w-14 h-14 shrink-0 border p-0.5 bg-[#FAF8F2] ${
                      selectedImg === idx ? 'border-[#171717]' : 'border-[#D8D2C6] opacity-60'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImg;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Controls */}
          <div className="md:col-span-6 space-y-4 md:space-y-5">
            <div className="border-b border-[#D8D2C6] pb-4 space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
                {product.brand || 'AURA'} / {product.category || 'Objek'}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#171717]">
                {product.title}
              </h3>
              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-mono text-xl font-bold text-[#171717]">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="font-mono text-xs text-[#6B675F] line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-xs text-[#6B675F] leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Color Variants */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#6B675F] block">
                  Varian Warna / Material
                </span>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((col, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(col)}
                      className={`w-6 h-6 border p-0.5 ${
                        selectedColor === col ? 'border-[#171717]' : 'border-[#D8D2C6]'
                      }`}
                    >
                      <span className="w-full h-full block" style={{ backgroundColor: col }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & CTA */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#6B675F]">Jumlah</span>
                <div className="flex items-center border border-[#D8D2C6] bg-[#FAF8F2]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center font-mono text-xs hover:bg-[#171717] hover:text-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center font-mono text-xs hover:bg-[#171717] hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button fullWidth size="md" onClick={handleAdd} className="gap-2">
                <ShoppingBag className="w-4 h-4" /> Tambah ke Keranjang
              </Button>

              <div className="flex justify-between items-center pt-2 font-mono text-[11px] uppercase tracking-wider text-[#6B675F]">
                <button
                  onClick={() => {
                    toggleWishlist(product);
                    addToast(isFavorite ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist', 'info');
                  }}
                  className="hover:text-[#F4512A] flex items-center gap-1"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#F4512A] text-[#F4512A]' : ''}`} />
                  <span>{isFavorite ? 'Tersimpan' : 'Simpan'}</span>
                </button>
                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="hover:text-[#171717] underline"
                >
                  Detail Lengkap →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
