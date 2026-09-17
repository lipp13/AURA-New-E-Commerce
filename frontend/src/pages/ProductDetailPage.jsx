import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { ProductGrid } from '../components/product/ProductGrid';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, Heart, Scale } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

import { ProductService } from '../services/ProductService';

export const ProductDetailPage = () => {
  const { products, loading } = useProducts();
  const { id } = useParams();
  const navigate = useNavigate();
  const [directProduct, setDirectProduct] = useState(null);

  const product = products.find(p => String(p.id) === String(id)) || directProduct;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { addToast } = useToast();

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Fallback to fetch single product directly from Supabase if not in list
  useEffect(() => {
    if (!product && id) {
      ProductService.getProductById(id).then(res => {
        if (res) setDirectProduct(res);
      });
    }
  }, [id, product]);

  const isFavorite = product ? isInWishlist(product.id) : false;
  const isCompared = product ? isInCompare(product.id) : false;

  // Track recently viewed & sync variants
  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
      window.scrollTo(0, 0);
      setSelectedImg(0);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : null);
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
    }
  }, [id, product]);

  // Loading skeleton while fetching product from backend
  if (loading) {
    return (
      <div className="pt-24 pb-24 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
        <div className="w-48 h-4 bg-[#ECE6D8] animate-pulse border border-[#D8D2C6]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/5] sm:aspect-square bg-[#ECE6D8] animate-pulse border border-[#D8D2C6]" />
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-[#ECE6D8] animate-pulse border border-[#D8D2C6]" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="w-24 h-4 bg-[#ECE6D8] animate-pulse border border-[#D8D2C6]" />
            <div className="w-full h-10 bg-[#ECE6D8] animate-pulse border border-[#D8D2C6]" />
            <div className="w-32 h-8 bg-[#ECE6D8] animate-pulse border border-[#D8D2C6]" />
            <div className="w-full h-24 bg-[#ECE6D8] animate-pulse border border-[#D8D2C6]" />
            <div className="w-full h-12 bg-[#ECE6D8] animate-pulse border border-[#D8D2C6]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-36 pb-28 max-w-md mx-auto text-center space-y-6 px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Spesimen Arsip]
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#171717]">
          Objek Tidak Ditemukan
        </h2>
        <p className="font-mono text-xs text-[#6B675F] leading-relaxed">
          Spesimen katalog yang Anda cari mungkin telah diarsipkan atau belum terdaftar dalam basis data.
        </p>
        <div className="pt-2">
          <Button onClick={() => navigate('/shop')}>
            Kembali ke Katalog
          </Button>
        </div>
      </div>
    );
  }

  const images = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'];

  // Related products from same category
  const relatedProducts = products
    .filter(p => p && p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    addToast(`Berhasil menambahkan ${quantity}x "${product.title}" ke keranjang`, 'success');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    navigate('/cart');
  };

  return (
    <div className="pt-24 pb-24 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
      {/* Breadcrumbs */}
      <Breadcrumb items={[
        { label: 'Katalog Belanja', link: '/shop' },
        { label: product.category || 'Kategori', link: `/shop?category=${product.categorySlug || ''}` },
        { label: product.title }
      ]} />

      {/* Main Split Layout: Left Gallery, Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Visual Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-2 sm:p-4">
            <div className="aspect-[4/5] sm:aspect-square overflow-hidden bg-[#ECE6D8]">
              <img
                src={images[selectedImg] || images[0]}
                alt={product.title}
                className="w-full h-full object-cover editorial-image-hover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                }}
              />
            </div>
            <div className="pt-3 flex justify-between items-baseline font-mono text-[10px] text-[#6B675F]">
              <span>SPESIMEN KATALOG N° {product.id}</span>
              <span>GAMBAR 0{selectedImg + 1} DARI {images.length}</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`aspect-square border p-1 bg-[#FAF8F2] transition-colors ${
                    selectedImg === idx ? 'border-[#171717]' : 'border-[#D8D2C6] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information Hierarchy & Actions */}
        <div className="lg:col-span-5 space-y-8">
          {/* Metadata & Title */}
          <div className="border-b border-[#D8D2C6] pb-6 space-y-3">
            <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-widest text-[#6B675F]">
              <span>{product.brand}</span>
              <span className="text-[#171717]">{product.category}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#171717] leading-[1.05]">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-4 pt-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#171717]">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="font-mono text-sm text-[#6B675F] line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
              {product.isFlashSale && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#F4512A] font-bold">
                  [Rilis Arsip Terbatas]
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#6B675F] leading-relaxed">
            {product.description}
          </p>

          {/* Color Variants */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3 border-t border-[#D8D2C6] pt-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#6B675F] block">
                Pilihan Warna &amp; Material
              </span>
              <div className="flex gap-2.5">
                {product.colors.map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(col)}
                    className={`w-8 h-8 border p-0.5 transition-colors flex items-center justify-center ${
                      selectedColor === col ? 'border-[#171717]' : 'border-[#D8D2C6]'
                    }`}
                  >
                    <span className="w-full h-full block" style={{ backgroundColor: col }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Variants */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3 border-t border-[#D8D2C6] pt-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#6B675F] block">
                Dimensi / Ukuran
              </span>
              <div className="flex gap-2 font-mono text-xs uppercase">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border transition-colors ${
                      selectedSize === size
                        ? 'bg-[#171717] text-[#F5F1E8] border-[#171717]'
                        : 'border-[#D8D2C6] text-[#171717] hover:border-[#171717]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="space-y-4 border-t border-[#D8D2C6] pt-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#6B675F]">
                Jumlah
              </span>
              <div className="flex items-center border border-[#D8D2C6] bg-[#FAF8F2]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-xs font-mono hover:bg-[#171717] hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-mono text-xs font-bold text-[#171717]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center text-xs font-mono hover:bg-[#171717] hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button fullWidth size="lg" onClick={handleAddToCart} className="gap-2">
                <ShoppingBag className="w-4 h-4" /> Tambah ke Keranjang
              </Button>
              <Button fullWidth size="lg" variant="secondary" onClick={handleBuyNow}>
                Beli Sekarang
              </Button>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-mono uppercase tracking-widest text-[#6B675F]">
              <button
                onClick={() => {
                  toggleWishlist(product);
                  addToast(isFavorite ? 'Dihapus dari objek tersimpan' : 'Disimpan ke wishlist', 'info');
                }}
                className="flex items-center gap-1.5 hover:text-[#F4512A] transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#F4512A] text-[#F4512A]' : ''}`} />
                <span>{isFavorite ? 'Tersimpan di Wishlist' : 'Simpan ke Wishlist'}</span>
              </button>

              <button
                onClick={() => {
                  const res = addToCompare(product);
                  addToast(res.message, res.success ? 'success' : 'error');
                }}
                className="flex items-center gap-1.5 hover:text-[#F4512A] transition-colors"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isCompared ? 'Dalam Daftar Banding' : 'Bandingkan Objek'}</span>
              </button>
            </div>
          </div>

          {/* Clean Service Ledger */}
          <div className="border-t border-[#D8D2C6] pt-6 space-y-2 text-xs font-mono text-[#6B675F]">
            <div className="flex justify-between py-1 border-b border-[#D8D2C6]/50">
              <span>PENGIRIMAN</span>
              <span className="text-[#171717]">Ekspres Nusantara 2-3 Hari</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#D8D2C6]/50">
              <span>GARANSI</span>
              <span className="text-[#171717]">Garansi Resmi Studio 2 Tahun</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#D8D2C6]/50">
              <span>RETUR</span>
              <span className="text-[#171717]">Jaminan Pengembalian Bebas Biaya 30 Hari</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications Section */}
      <section className="border-t border-[#D8D2C6] pt-12 space-y-6">
        <div className="flex items-baseline justify-between border-b border-[#D8D2C6] pb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F]">[Berkas Teknis]</span>
          <span className="font-mono text-xs uppercase tracking-widest text-[#171717]">Spesifikasi Objek</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 divide-y md:divide-y-0 divide-[#D8D2C6] font-mono text-xs">
          <div className="space-y-3">
            {Object.entries(product.specifications || {}).slice(0, 2).map(([key, val]) => (
              <div key={key} className="flex justify-between py-2 border-b border-[#D8D2C6]">
                <span className="text-[#6B675F] uppercase tracking-wider">{key}</span>
                <span className="text-[#171717] font-bold">{val}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Object.entries(product.specifications || {}).slice(2).map(([key, val]) => (
              <div key={key} className="flex justify-between py-2 border-b border-[#D8D2C6]">
                <span className="text-[#6B675F] uppercase tracking-wider">{key}</span>
                <span className="text-[#171717] font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Objects Section */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#D8D2C6] pt-16 space-y-8">
          <div className="flex items-baseline justify-between border-b border-[#D8D2C6] pb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F]">[Objek Pendamping]</span>
            <Link to={`/shop?category=${product.categorySlug}`} className="font-mono text-xs uppercase tracking-widest text-[#171717] hover:text-[#F4512A]">
              Lihat Semua {product.category} →
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
};
