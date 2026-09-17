import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import { QuickViewModal } from './QuickViewModal';

export const ProductGrid = ({
  products = [],
  loading = false,
  layout = 'grid',
  emptyMessage = 'Tidak ada objek yang sesuai dengan kriteria pilihan Anda.'
}) => {
  const [selectedQuickView, setSelectedQuickView] = useState(null);

  if (loading) {
    return (
      <div className={`grid gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12 ${layout === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-[#D8D2C6] bg-[#FAF8F2]">
        <span className="font-mono text-xs text-[#6B675F] uppercase tracking-widest mb-2">[Arsip Kosong]</span>
        <h4 className="font-display text-xl font-bold text-[#171717] uppercase mb-2">Objek Tidak Ditemukan</h4>
        <p className="text-xs text-[#6B675F] max-w-sm font-mono leading-relaxed">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12 ${layout === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            layout={layout}
            onQuickView={(p) => setSelectedQuickView(p)}
          />
        ))}
      </div>

      <QuickViewModal
        product={selectedQuickView}
        isOpen={Boolean(selectedQuickView)}
        onClose={() => setSelectedQuickView(null)}
      />
    </>
  );
};
