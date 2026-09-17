import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductGrid } from '../components/product/ProductGrid';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useSmoothScroll } from '../components/common/SmoothScrollProvider';
import { LayoutGrid, List, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

export const ShopPage = () => {
  const { products, loading, error, refetch } = useProducts();
  const { categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const { scrollTo } = useSmoothScroll();

  // Layout mode: 'grid' or 'list'
  const [layout, setLayout] = useState('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Dynamic maximum price from products
  const maxProductPrice = useMemo(() => {
    if (!products || products.length === 0) return 5000000;
    const max = Math.max(...products.map(p => Number(p.price) || 0));
    return Math.max(Math.ceil(max / 100000) * 100000, 2000000);
  }, [products]);

  // Dynamic product count per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    (products || []).forEach(p => {
      if (!p) return;
      if (p.categoryId) counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      if (p.category) counts[(p.category).toLowerCase()] = (counts[(p.category).toLowerCase()] || 0) + 1;
      if (p.categorySlug) counts[(p.categorySlug).toLowerCase()] = (counts[(p.categorySlug).toLowerCase()] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filters State (null means unrestricted / all prices allowed)
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // Sort Option
  const [sortBy, setSortBy] = useState('popular');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  // Sync category state when URL changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p) return false;
      // Category Filter
      if (selectedCategory !== 'all') {
        const catObj = categories.find(c => 
          c.id === selectedCategory || 
          c.slug === selectedCategory || 
          (c.name || '').toLowerCase() === selectedCategory.toLowerCase()
        );
        const pCat = (p.category || '').toLowerCase();
        const pSlug = (p.categorySlug || '').toLowerCase();
        const pCatId = (p.categoryId || '').toLowerCase();

        const targetId = (catObj?.id || selectedCategory).toLowerCase();
        const targetName = (catObj?.name || selectedCategory).toLowerCase();
        const targetSlug = (catObj?.slug || selectedCategory).toLowerCase();

        const match = pCatId === targetId || 
                      pCat === targetName || 
                      pSlug === targetSlug || 
                      pCat === targetSlug;
        if (!match) return false;
      }
      // Price Filter
      const price = typeof p.price === 'number' ? p.price : Number(p.price) || 0;
      if (priceRange !== null && price > priceRange) return false;
      // Rating Filter
      const rating = typeof p.rating === 'number' ? p.rating : Number(p.rating) || 0;
      if (rating < minRating) return false;
      // In Stock
      if (inStockOnly && (p.stock || 0) <= 0) return false;
      // On Sale
      if (onSaleOnly && !p.isFlashSale && !p.oldPrice) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a?.price || 0;
      const priceB = b?.price || 0;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return (b?.rating || 0) - (a?.rating || 0);
      if (sortBy === 'newest') return (b?.id || 0) - (a?.id || 0);
      return (b?.soldCount || 0) - (a?.soldCount || 0); // Popularity
    });
  }, [products, selectedCategory, priceRange, minRating, inStockOnly, onSaleOnly, sortBy]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setPriceRange(null);
    setMinRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('popular');
    setCurrentPage(1);
    setSearchParams({});
  };

  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) +
    (priceRange !== null && priceRange < maxProductPrice ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0);

  return (
    <div className="pt-24 pb-20 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-10">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Katalog Belanja' }]} />

      {/* Editorial Header */}
      <div className="border-b border-[#D8D2C6] pb-8 space-y-3">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Koleksi Permanen]
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#171717]">
          Katalog Belanja
        </h1>
        <p className="text-xs sm:text-sm font-mono text-[#6B675F] max-w-xl leading-relaxed">
          Menampilkan {filteredProducts.length} objek dalam {categories.length} disiplin desain. Dikurasi berdasarkan mutu material dan utilitas fungsi.
        </p>
      </div>

      {/* Top Controls Bar: Categories & Sorting */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#D8D2C6] pb-6 gap-6">
        {/* Horizontal Category Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs font-mono uppercase tracking-widest">
          <button
            onClick={() => { setSelectedCategory('all'); setCurrentPage(1); setSearchParams({}); }}
            className={`px-3 py-1.5 transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#171717] text-[#F5F1E8]'
                : 'text-[#6B675F] hover:text-[#171717]'
            }`}
          >
            Semua [{products.length}]
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
            const count = categoryCounts[cat.id] || categoryCounts[cat.name.toLowerCase()] || categoryCounts[cat.slug] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                  setSearchParams({ category: cat.slug || cat.id });
                }}
                className={`px-3 py-1.5 transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#171717] text-[#F5F1E8]'
                    : 'text-[#6B675F] hover:text-[#171717]'
                }`}
              >
                {cat.name} [{count}]
              </button>
            );
          })}
        </div>

        {/* Right Tools: Filter Toggle, Sort, Layout */}
        <div className="flex items-center justify-between lg:justify-end gap-4 flex-shrink-0">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 border border-[#D8D2C6] bg-[#FAF8F2] px-4 py-2 text-xs font-mono uppercase tracking-widest text-[#171717] lg:hidden"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#6B675F]">
            <span className="hidden sm:inline">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="bg-[#FAF8F2] border border-[#D8D2C6] px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#171717] focus:outline-none focus:border-[#171717]"
            >
              <option value="popular">Paling Populer</option>
              <option value="price-low">Harga: Rendah ke Tinggi</option>
              <option value="price-high">Harga: Tinggi ke Rendah</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="newest">Koleksi Terbaru</option>
            </select>
          </div>

          {/* Layout Grid / List Toggles */}
          <div className="hidden sm:flex items-center border border-[#D8D2C6] bg-[#FAF8F2]">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 transition-colors ${layout === 'grid' ? 'bg-[#171717] text-[#F5F1E8]' : 'text-[#6B675F] hover:text-[#171717]'}`}
              title="Tampilan Kisi (Grid)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 transition-colors ${layout === 'list' ? 'bg-[#171717] text-[#F5F1E8]' : 'text-[#6B675F] hover:text-[#171717]'}`}
              title="Tampilan Daftar (List)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Desktop Editorial Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-28 border border-[#D8D2C6] bg-[#FAF8F2] p-6">
          <div className="flex items-center justify-between border-b border-[#D8D2C6] pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#171717]">
              Saring Arsip
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-mono uppercase text-[#F4512A] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-[11px] font-mono uppercase tracking-widest text-[#6B675F]">
              <span>Batas Maksimal</span>
              <span className="text-[#171717] font-bold">{formatPrice(priceRange ?? maxProductPrice)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxProductPrice}
              step="50000"
              value={priceRange ?? maxProductPrice}
              onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPage(1); }}
              className="w-full accent-[#171717] cursor-pointer"
            />
          </div>

          {/* Rating Filter */}
          <div className="space-y-2 border-t border-[#D8D2C6] pt-4">
            <label className="text-[11px] font-mono uppercase tracking-widest text-[#6B675F] block">
              Rating Minimal
            </label>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono uppercase">
              {[0, 4, 4.5].map((stars) => (
                <button
                  key={stars}
                  onClick={() => { setMinRating(stars); setCurrentPage(1); }}
                  className={`py-1.5 border transition-colors ${
                    minRating === stars
                      ? 'bg-[#171717] text-[#F5F1E8] border-[#171717]'
                      : 'border-[#D8D2C6] bg-transparent text-[#6B675F] hover:border-[#171717]'
                  }`}
                >
                  {stars === 0 ? 'Semua' : `${stars}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 border-t border-[#D8D2C6] pt-4 text-xs font-mono uppercase tracking-wider text-[#171717]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => { setInStockOnly(e.target.checked); setCurrentPage(1); }}
                className="accent-[#171717] w-3.5 h-3.5"
              />
              <span>Hanya Stok Tersedia</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => { setOnSaleOnly(e.target.checked); setCurrentPage(1); }}
                className="accent-[#F4512A] w-3.5 h-3.5"
              />
              <span>Hanya Penawaran Promo</span>
            </label>
          </div>
        </aside>

        {/* Product Catalog Display */}
        <main className="lg:col-span-9 space-y-8">
          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-2 font-mono text-xs">
              <span className="text-[#6B675F] uppercase tracking-widest text-[10px]">Diterapkan:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F2] border border-[#D8D2C6] text-[#171717]">
                  {categories.find(c => c.id === selectedCategory || c.slug === selectedCategory)?.name || selectedCategory}
                  <X className="w-3 h-3 cursor-pointer hover:text-[#F4512A]" onClick={() => { setSelectedCategory('all'); setSearchParams({}); }} />
                </span>
              )}
              {priceRange !== null && priceRange < maxProductPrice && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F2] border border-[#D8D2C6] text-[#171717]">
                  &lt; {formatPrice(priceRange)}
                  <X className="w-3 h-3 cursor-pointer hover:text-[#F4512A]" onClick={() => setPriceRange(null)} />
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#F4512A] underline uppercase tracking-widest ml-2"
              >
                Hapus Semua Filter
              </button>
            </div>
          )}

          {/* Backend Error Alert Banner */}
          {error && (
            <div className="border border-[#F4512A] bg-[#FAF8F2] p-6 space-y-3 mb-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#F4512A] font-bold uppercase tracking-wider">
                  [Kendala Koneksi Database Backend]
                </span>
                <button
                  onClick={() => refetch()}
                  className="font-mono text-xs underline text-[#171717] hover:text-[#F4512A] uppercase"
                >
                  Coba Lagi ↻
                </button>
              </div>
              <p className="text-xs text-[#6B675F] leading-relaxed">
                Backend server merespons: <strong className="text-[#171717] font-mono">{error}</strong>.
              </p>
              <p className="text-[11px] font-mono text-[#6B675F] leading-relaxed border-t border-[#D8D2C6] pt-2">
                💡 <strong>Penyebab</strong>: Server backend di Vercel belum memiliki Environment Variables Supabase (<code className="bg-[#ECE6D8] px-1">SUPABASE_URL</code> &amp; <code className="bg-[#ECE6D8] px-1">SUPABASE_ANON_KEY</code>), atau project Supabase sedang dalam status <em>Paused</em>.
              </p>
            </div>
          )}

          {/* Products Grid */}
          <ProductGrid
            products={currentProducts}
            loading={loading}
            layout={layout}
            emptyMessage={error ? "Katalog gagal dimuat dari server backend." : "Tidak ada objek katalog yang cocok dengan kriteria pilihan Anda. Coba atur ulang filter."}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              scrollTo(150);
            }}
          />
        </main>
      </div>

      {/* Mobile Filter Slide-Over Modal with Complete Controls */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-sm bg-[#F5F1E8] h-full p-6 space-y-6 overflow-y-auto border-l border-[#D8D2C6]">
            <div className="flex justify-between items-center border-b border-[#D8D2C6] pb-4">
              <span className="font-mono text-xs uppercase tracking-widest font-bold">Filter Katalog</span>
              <button onClick={() => setIsMobileFilterOpen(false)} aria-label="Tutup filter">
                <X className="w-5 h-5 text-[#171717]" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#6B675F] block">Kategori Disiplin</label>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] uppercase max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                  className={`p-2 border text-left truncate transition-colors ${selectedCategory === 'all' ? 'bg-[#171717] text-[#F5F1E8] border-[#171717]' : 'bg-[#FAF8F2] border-[#D8D2C6]'}`}
                >
                  Semua
                </button>
                {categories.map((c) => {
                  const isSelected = selectedCategory === c.id || selectedCategory === c.slug;
                  const count = categoryCounts[c.id] || categoryCounts[c.name.toLowerCase()] || categoryCounts[c.slug] || 0;
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCategory(c.id); setCurrentPage(1); }}
                      className={`p-2 border text-left truncate transition-colors flex justify-between items-center ${isSelected ? 'bg-[#171717] text-[#F5F1E8] border-[#171717]' : 'bg-[#FAF8F2] border-[#D8D2C6]'}`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="text-[9px] opacity-70 ml-1">[{count}]</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2 border-t border-[#D8D2C6] pt-4">
              <div className="flex justify-between items-baseline text-[11px] font-mono uppercase tracking-widest text-[#6B675F]">
                <span>Batas Harga Maksimal</span>
                <span className="text-[#171717] font-bold">{formatPrice(priceRange ?? maxProductPrice)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={maxProductPrice}
                step="50000"
                value={priceRange ?? maxProductPrice}
                onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full accent-[#171717] cursor-pointer"
              />
            </div>

            {/* Rating Filter */}
            <div className="space-y-2 border-t border-[#D8D2C6] pt-4">
              <label className="text-[11px] font-mono uppercase tracking-widest text-[#6B675F] block">
                Rating Minimal
              </label>
              <div className="grid grid-cols-3 gap-1 text-[11px] font-mono uppercase">
                {[0, 4, 4.5].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => { setMinRating(stars); setCurrentPage(1); }}
                    className={`py-1.5 border text-center transition-colors ${
                      minRating === stars
                        ? 'bg-[#171717] text-[#F5F1E8] border-[#171717]'
                        : 'border-[#D8D2C6] bg-[#FAF8F2] text-[#6B675F]'
                    }`}
                  >
                    {stars === 0 ? 'Semua' : `${stars}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 border-t border-[#D8D2C6] pt-4 text-xs font-mono uppercase tracking-wider text-[#171717]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => { setInStockOnly(e.target.checked); setCurrentPage(1); }}
                  className="accent-[#171717] w-3.5 h-3.5"
                />
                <span>Hanya Stok Tersedia</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => { setOnSaleOnly(e.target.checked); setCurrentPage(1); }}
                  className="accent-[#F4512A] w-3.5 h-3.5"
                />
                <span>Hanya Promo</span>
              </label>
            </div>

            <div className="pt-4 border-t border-[#D8D2C6] flex gap-3">
              <button
                onClick={handleResetFilters}
                className="w-1/3 py-3 border border-[#D8D2C6] bg-[#FAF8F2] text-[#171717] font-mono text-xs uppercase tracking-widest"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-2/3 py-3 bg-[#171717] text-[#F5F1E8] font-mono text-xs uppercase tracking-widest"
              >
                Terapkan ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
