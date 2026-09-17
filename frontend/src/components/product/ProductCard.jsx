import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/formatters';

export const ProductCard = ({ product, onQuickView, layout = 'grid' }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    addToast(`Berhasil menambahkan "${product.title}" ke keranjang`, 'success');
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    addToast(isFavorite ? 'Dihapus dari objek tersimpan' : 'Disimpan ke wishlist', 'info');
  };

  if (layout === 'list') {
    return (
      <div className="group border-b border-[#D8D2C6] py-6 flex flex-col sm:flex-row items-baseline justify-between gap-6 transition-colors">
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <Link to={`/product/${product.id}`} className="w-24 h-28 bg-[#FAF8F2] border border-[#D8D2C6] overflow-hidden flex-shrink-0 block">
            <img
              src={primaryImage}
              alt={product.title}
              className="w-full h-full object-cover editorial-image-hover"
            />
          </Link>

          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
              {product.brand} / {product.category}
            </span>
            <Link to={`/product/${product.id}`}>
              <h3 className="font-display text-base font-bold text-[#171717] hover:text-[#F4512A] transition-colors">
                {product.title}
              </h3>
            </Link>
            <p className="text-xs text-[#6B675F] line-clamp-1 max-w-md">
              {product.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 self-end sm:self-center">
          <span className="font-mono text-base font-bold text-[#171717]">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] px-4 py-2 text-[11px] font-mono uppercase tracking-widest transition-colors"
          >
            + Keranjang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Editorial Framed Image */}
      <div className="relative aspect-[4/5] bg-[#FAF8F2] border border-[#D8D2C6] overflow-hidden">
        <Link to={`/product/${product.id}`} className="w-full h-full block overflow-hidden">
          <img
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80';
            }}
          />
        </Link>

        {/* Minimal Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 transition-colors ${
            isFavorite ? 'text-[#F4512A]' : 'text-[#171717]/60 hover:text-[#F4512A]'
          }`}
          aria-label="Simpan ke wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#F4512A]' : ''}`} />
        </button>

        {/* Minimal Sale Tag */}
        {product.isFlashSale && (
          <div className="absolute top-3 left-3 bg-[#F4512A] text-white text-[10px] font-mono uppercase tracking-widest px-2 py-0.5">
            Promo
          </div>
        )}

        {/* Quick Add Overlay: Always visible on touch/mobile, hover on desktop */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-[#FAF8F2]/95 backdrop-blur-sm border-t border-[#D8D2C6] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex justify-between items-center">
          <button
            onClick={handleAddToCart}
            className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#171717] hover:text-[#F4512A] font-bold flex items-center gap-1.5"
            aria-label="Tambah ke keranjang"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Keranjang</span>
          </button>
          <Link
            to={`/product/${product.id}`}
            className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#6B675F] hover:text-[#171717]"
          >
            Detail →
          </Link>
        </div>
      </div>

      {/* Typography & Metadata Below Image */}
      <div className="pt-3.5 space-y-1">
        <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest text-[#6B675F]">
          <span className="truncate max-w-[140px]">{product.brand}</span>
          <span>{product.category}</span>
        </div>

        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-display text-sm font-bold text-[#171717] group-hover:text-[#F4512A] transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="font-mono text-sm font-bold text-[#171717]">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="font-mono text-xs text-[#6B675F] line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
