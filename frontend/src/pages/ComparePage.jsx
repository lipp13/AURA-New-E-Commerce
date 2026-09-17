import React from 'react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';

export const ComparePage = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (compareList.length === 0) {
    return (
      <div className="pt-36 pb-28 max-w-lg mx-auto px-6 text-center space-y-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Matriks Tidak Aktif]
        </span>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-[#171717]">
          Belum Ada Objek dalam Matriks Perbandingan
        </h2>
        <p className="font-mono text-xs text-[#6B675F] leading-relaxed">
          Pilih hingga 4 objek katalog untuk mengevaluasi spesifikasi teknis dan dimensi secara berdampingan.
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

  // Unique spec keys
  const allSpecKeys = Array.from(
    new Set(compareList.flatMap(item => Object.keys(item.specifications || {})))
  );

  return (
    <div className="pt-24 pb-24 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
      <Breadcrumb items={[{ label: 'Matriks Spesifikasi' }]} />

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#D8D2C6] pb-6 gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
            [Matriks Teknis]
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#171717]">
            Bandingkan Spesifikasi ({compareList.length}/4)
          </h1>
        </div>

        <button
          onClick={clearCompare}
          className="font-mono text-xs uppercase tracking-widest text-[#6B675F] hover:text-[#171717] underline self-start sm:self-auto"
        >
          Kosongkan Matriks
        </button>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden font-mono text-[10px] uppercase tracking-widest text-[#6B675F] flex items-center gap-1.5">
        <span>← Geser tabel secara horizontal untuk melihat semua kriteria →</span>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto no-scrollbar border border-[#D8D2C6] bg-[#FAF8F2]">
        <table className="w-full min-w-[700px] text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#D8D2C6] bg-[#F5F1E8]">
              <th className="p-6 w-1/5 text-[#6B675F] uppercase tracking-widest">[Kriteria]</th>
              {compareList.map(prod => (
                <th key={prod.id} className="p-6 text-left relative min-w-[200px]">
                  <button
                    onClick={() => removeFromCompare(prod.id)}
                    className="absolute top-4 right-4 text-[#6B675F] hover:text-[#171717]"
                    title="Hapus objek dari pembanding"
                    aria-label="Hapus dari pembanding"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Link to={`/product/${prod.id}`} className="block w-24 h-28 border border-[#D8D2C6] bg-white overflow-hidden mb-3">
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                      alt={prod.title || ''}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                      }}
                    />
                  </Link>
                  <Link to={`/product/${prod.id}`} className="font-display text-sm font-bold text-[#171717] hover:text-[#F4512A] block uppercase">
                    {prod.title}
                  </Link>
                  <span className="font-mono text-sm font-bold text-[#171717] mt-1 block">
                    {formatPrice(prod.price)}
                  </span>
                  <div className="mt-3">
                    <Button size="sm" onClick={() => addToCart(prod, 1)}>
                      + Keranjang
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D2C6]">
            <tr>
              <td className="p-6 text-[#6B675F] uppercase tracking-wider font-bold">Kategori</td>
              {compareList.map(prod => (
                <td key={prod.id} className="p-6 text-[#171717] font-bold">{prod.category}</td>
              ))}
            </tr>
            <tr>
              <td className="p-6 text-[#6B675F] uppercase tracking-wider font-bold">Manufaktur / Merek</td>
              {compareList.map(prod => (
                <td key={prod.id} className="p-6 text-[#171717]">{prod.brand}</td>
              ))}
            </tr>
            <tr>
              <td className="p-6 text-[#6B675F] uppercase tracking-wider font-bold">Ketersediaan Stok</td>
              {compareList.map(prod => (
                <td key={prod.id} className="p-6 text-[#171717]">
                  {prod.stock > 0 ? `Tersedia (${prod.stock} unit)` : 'Habis / Diarsipkan'}
                </td>
              ))}
            </tr>
            {allSpecKeys.map(key => (
              <tr key={key}>
                <td className="p-6 text-[#6B675F] uppercase tracking-wider font-bold">{key}</td>
                {compareList.map(prod => (
                  <td key={prod.id} className="p-6 text-[#171717]">
                    {prod.specifications?.[key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
