import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { ArrowRight } from 'lucide-react';

const categoryImages = {
  electronics: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
  fashion: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
  beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
  'home-living': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
  'home & living': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
};

export const TrendingCategories = () => {
  const { categories } = useCategories();
  const { products } = useProducts();
  const [activeCatId, setActiveCatId] = useState(null);

  const activeCategory = categories.find(c => c.id === activeCatId || c.slug === activeCatId) || categories[0];
  const activeSlug = (activeCategory?.slug || activeCategory?.name || 'electronics').toLowerCase();
  const currentImg = categoryImages[activeSlug] || activeCategory?.image || categoryImages.electronics;

  return (
    <section className="py-20 border-b border-[#D8D2C6]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#D8D2C6] pb-4 mb-12 gap-2">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F]">[01]</span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#171717]">
              Kategori Arsip Supabase
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-mono uppercase tracking-widest text-[#171717] hover:text-[#F4512A] flex items-center gap-1 transition-colors"
          >
            <span>Buka Seluruh Katalog ({products.length} Objek)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Editorial Layout: Left interactive typography list, Right large framed photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Typography List */}
          <div className="lg:col-span-7 divide-y divide-[#D8D2C6]">
            {categories.map((cat, idx) => {
              const isSelected = (activeCategory?.id === cat.id);
              const prodCount = products.filter(p => {
                if (!p) return false;
                const pCat = (p.category || '').toLowerCase();
                const pSlug = (p.categorySlug || '').toLowerCase();
                const pCatId = (p.categoryId || '').toLowerCase();
                const targetId = (cat.id || '').toLowerCase();
                const targetName = (cat.name || '').toLowerCase();
                const targetSlug = (cat.slug || '').toLowerCase();
                return pCatId === targetId || pCat === targetName || pSlug === targetSlug;
              }).length;

              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug || cat.id}`}
                  onMouseEnter={() => setActiveCatId(cat.id)}
                  className="group py-5 flex items-baseline justify-between transition-colors block"
                >
                  <div className="flex items-baseline gap-6">
                    <span className="font-mono text-[11px] text-[#6B675F] group-hover:text-[#F4512A]">
                      0{idx + 1}
                    </span>
                    <span className={`font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight transition-colors ${
                      isSelected ? 'text-[#F4512A]' : 'text-[#171717] group-hover:text-[#F4512A]'
                    }`}>
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[11px] text-[#6B675F]">
                      [{prodCount} Objek Tersedia]
                    </span>
                    <span className="font-mono text-sm text-[#171717] opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right: Dynamic Framed Preview */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-3">
              <div className="aspect-[4/5] overflow-hidden bg-[#ECE6D8] relative">
                <img
                  key={activeCategory?.id || 'default'}
                  src={currentImg}
                  alt={activeCategory?.name || 'Visual Kategori'}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
              </div>
              <div className="pt-3 flex justify-between items-baseline font-mono text-[11px] text-[#6B675F]">
                <span>ARSIP SUPABASE</span>
                <span className="text-[#171717] uppercase font-bold">{activeCategory?.name || ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
