import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HeroSection } from '../components/home/HeroSection';
import { BrandLogos } from '../components/home/BrandLogos';
import { TrendingCategories } from '../components/home/TrendingCategories';
import { CuratedCollections } from '../components/home/CuratedCollections';
import { NewsletterSection } from '../components/home/NewsletterSection';
import { ProductGrid } from '../components/product/ProductGrid';
import { useProducts } from '../hooks/useProducts';

export const HomePage = () => {
  const { products, loading } = useProducts();
  const [tab, setTab] = useState('featured');

  const featuredProducts = useMemo(() => {
    const list = products.filter(p => p.isBestseller);
    return list.length > 0 ? list.slice(0, 8) : products.slice(0, 8);
  }, [products]);

  const newArrivals = useMemo(() => {
    const list = products.filter(p => p.isNewArrival);
    return list.length > 0 ? list.slice(0, 8) : products.slice(0, 8);
  }, [products]);

  const topRated = useMemo(() => {
    const list = products.filter(p => (p.rating || 0) >= 4.5);
    return list.length > 0 ? list.slice(0, 8) : products.slice(0, 8);
  }, [products]);

  const activeProducts = tab === 'featured' ? featuredProducts : tab === 'new' ? newArrivals : topRated;

  return (
    <div className="bg-[#F5F1E8] text-[#171717]">
      {/* 1. EDITORIAL HERO (Monumental, Clean, No yellow headset card) */}
      <HeroSection />

      {/* 2. ARCHITECTURAL BRAND TICKER */}
      <BrandLogos />

      {/* 3. FEATURED EXHIBITION (Asymmetric Image Composition) */}
      <CuratedCollections />

      {/* 4. NEW ARRIVALS & CURATED CATALOG SHOWCASE */}
      <section className="py-24 border-b border-[#D8D2C6]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header with Minimalist Tab Switches */}
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[#D8D2C6] pb-4 mb-16 gap-6">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F]">[03]</span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#171717]">
                Arsip Terkurasi
              </h2>
            </div>

            {/* Restrained Typographic Tab Navigation */}
            <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
              <button
                onClick={() => setTab('featured')}
                className={`pb-1 transition-colors relative ${
                  tab === 'featured'
                    ? 'text-[#171717] font-bold'
                    : 'text-[#6B675F] hover:text-[#171717]'
                }`}
              >
                <span>Terlaris</span>
                {tab === 'featured' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#F4512A]" />
                )}
              </button>

              <button
                onClick={() => setTab('new')}
                className={`pb-1 transition-colors relative ${
                  tab === 'new'
                    ? 'text-[#171717] font-bold'
                    : 'text-[#6B675F] hover:text-[#171717]'
                }`}
              >
                <span>Koleksi Baru</span>
                {tab === 'new' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#F4512A]" />
                )}
              </button>

              <button
                onClick={() => setTab('top')}
                className={`pb-1 transition-colors relative ${
                  tab === 'top'
                    ? 'text-[#171717] font-bold'
                    : 'text-[#6B675F] hover:text-[#171717]'
                }`}
              >
                <span>Rating Tertinggi</span>
                {tab === 'top' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#F4512A]" />
                )}
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid products={activeProducts} loading={loading} />

          {/* Restrained Link to Shop */}
          <div className="mt-16 pt-8 border-t border-[#D8D2C6] flex flex-col sm:flex-row justify-between items-baseline gap-4">
            <span className="font-mono text-xs text-[#6B675F] uppercase tracking-widest">
              Menampilkan {Math.min(activeProducts.length, 8)} dari {products.length} objek katalog
            </span>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#171717] hover:text-[#F4512A] transition-colors"
            >
              <span>Jelajahi Seluruh Koleksi Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL STORY (Magazine-Style Double Spread) */}
      <section className="py-28 border-b border-[#D8D2C6] bg-[#FAF8F2]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B675F] block">
                [Fitur Editorial — Vol. 08]
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-[#171717] leading-[0.98]">
                Pencarian Utilitas yang Hening.
              </h2>
              <div className="space-y-4 text-xs text-[#6B675F] leading-relaxed pt-2">
                <p>
                  Di tengah dunia yang sarat dengan distraksi digital dan barang konsumsi sekali pakai, kami mengedepankan bobot material yang bertahan lama. Sebuah objek harus layak menempati ruang hidup Anda melalui ketahanan, keseimbangan akustik, dan kenyamanan sentuhan.
                </p>
                <p>
                  Mulai dari bingkai aluminium anodisasi hingga denim selvedge Jepang berkepadatan tinggi, mitra manufaktur kami mematuhi standar keahlian artisan turun-temurun. Kami tidak merancang untuk tren sesaat.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  to="/about"
                  className="text-xs font-mono uppercase tracking-widest text-[#171717] hover:text-[#F4512A] underline underline-offset-4 transition-colors"
                >
                  Baca Manifesto Studio Lengkap →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="border border-[#D8D2C6] bg-[#F5F1E8] p-3 sm:p-4">
                <div className="aspect-[16/10] overflow-hidden bg-[#ECE6D8]">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85"
                    alt="AURA Design Studio Atelier"
                    className="w-full h-full object-cover editorial-image-hover"
                  />
                </div>
                <div className="pt-3 flex justify-between items-baseline font-mono text-[10px] text-[#6B675F]">
                  <span>ARSIP ATELIER / STUDIO MILANO</span>
                  <span>FOTOGRAFI OLEH J. LINDQVIST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CATEGORY & COLLECTION (Image & Typography Navigation) */}
      <TrendingCategories />

      {/* 7. FINAL BRAND STATEMENT (Typographic, Minimal, Confident) */}
      <section className="py-32 border-b border-[#D8D2C6] text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#F4512A] block font-bold">
            [Mutu Material Murni]
          </span>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-[#171717] leading-[1.05]">
            "Kami tidak merancang untuk kuartal mendatang. Kami berkarya untuk generasi berikutnya."
          </h2>
          <p className="font-mono text-xs uppercase tracking-widest text-[#6B675F] pt-4">
            ARSIP DESAIN AURA — DIDIRIKAN 2026
          </p>
        </div>
      </section>

      {/* 8. STUDIO DISPATCHES (Newsletter) */}
      <NewsletterSection />
    </div>
  );
};
