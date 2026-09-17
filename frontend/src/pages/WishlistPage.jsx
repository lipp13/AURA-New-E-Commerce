import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ProductGrid } from '../components/product/ProductGrid';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WishlistPage = () => {
  const { wishlist, clearWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="pt-36 pb-28 max-w-lg mx-auto px-6 text-center space-y-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Arsip Kosong]
        </span>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-[#171717]">
          Belum Ada Objek yang Disimpan
        </h2>
        <p className="font-mono text-xs text-[#6B675F] leading-relaxed">
          Tandai objek favorit dari katalog kami untuk memantau spesifikasi atau memesan di waktu mendatang.
        </p>
        <div className="pt-2">
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
      <Breadcrumb items={[{ label: 'Objek Disimpan' }]} />

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#D8D2C6] pb-6 gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
            [Kurasi Pribadi]
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#171717]">
            Objek Disimpan ({wishlist.length})
          </h1>
        </div>

        <button
          onClick={clearWishlist}
          className="font-mono text-xs uppercase tracking-widest text-rose-700 hover:text-rose-900 underline self-start sm:self-auto"
        >
          Hapus Semua Arsip
        </button>
      </div>

      <ProductGrid products={wishlist} />
    </div>
  );
};
