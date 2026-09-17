import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Search, X } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/formatters';

export const SearchModal = ({ isOpen, onClose }) => {
  const { products } = useProducts();
  const [query, setQuery] = useState('');

  const trendingSearches = useMemo(() => {
    if (products.length > 0) {
      return [...new Set(products.map(p => p.title.split(' ')[0]).filter(Boolean))].slice(0, 7);
    }
    return ['Headphone', 'Power Bank', 'Serum', 'Smartwatch', 'Speaker'];
  }, [products]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter((p) => {
      if (!p) return false;
      const title = (p.title || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      return title.includes(q) || category.includes(q) || brand.includes(q);
    }).slice(0, 8);
  }, [products, query]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Search input field */}
        <div className="relative flex items-center border-b border-[#D8D2C6] pb-4">
          <Search className="w-5 h-5 text-[#6B675F] mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari arsip objek, material, atau kategori..."
            autoFocus
            className="w-full bg-transparent font-display text-lg sm:text-2xl font-bold uppercase tracking-tight text-[#171717] placeholder-[#A09A8E] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#6B675F] hover:text-[#171717]"
              aria-label="Hapus kata kunci"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Search Results */}
        {query ? (
          <div className="space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
              Hasil Pencarian Arsip ({results.length})
            </span>
            {results.length > 0 ? (
              <div className="divide-y divide-[#D8D2C6] max-h-80 overflow-y-auto pr-1">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={onClose}
                    className="group py-3 flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-14 border border-[#D8D2C6] bg-[#ECE6D8] flex-shrink-0 overflow-hidden">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                          alt={product.title || ''}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                          }}
                        />
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#6B675F] block">
                          {product.brand} • {product.category}
                        </span>
                        <h4 className="font-display text-sm font-bold uppercase text-[#171717] group-hover:text-[#F4512A] transition-colors truncate max-w-sm">
                          {product.title}
                        </h4>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#171717]">
                      {formatPrice(product.price)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center font-mono text-xs text-[#6B675F]">
                Tidak ada spesimen arsip yang cocok dengan "{query}".
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
              Istilah Pencarian Populer
            </span>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 border border-[#D8D2C6] bg-[#F5F1E8] font-mono text-xs text-[#171717] hover:border-[#171717] hover:bg-[#FAF8F2] transition-colors uppercase"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
