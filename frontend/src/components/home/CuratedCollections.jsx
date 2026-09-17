import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CuratedCollections = () => {
  return (
    <section className="py-24 border-b border-[#D8D2C6]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex items-baseline justify-between border-b border-[#D8D2C6] pb-4 mb-16">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F]">[02]</span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#171717] font-semibold">Pameran Pilihan</span>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] hidden sm:inline">
            Seri 02 / Riset Ruang Studio
          </span>
        </div>

        {/* Asymmetric Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Dominant Framed Visual */}
          <div className="lg:col-span-7">
            <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-3 sm:p-4">
              <div className="aspect-[16/10] overflow-hidden bg-[#ECE6D8]">
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85"
                  alt="Furnitur Arsitektural & Ruang Hidup"
                  className="w-full h-full object-cover editorial-image-hover"
                />
              </div>
              <div className="pt-3 flex justify-between items-baseline font-mono text-[11px] text-[#6B675F]">
                <span>GMB. 02 — RANGKAIAN FURNITUR SKULPTURAL</span>
                <span className="text-[#171717]">MILANO &amp; STOCKHOLM</span>
              </div>
            </div>
          </div>

          {/* Typography & Supporting Image Offset */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#F4512A] font-bold block">
                Ruang Kerja Sang Arsitek
              </span>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#171717] leading-[1.02]">
                Bentuk Berpadu Integritas Material.
              </h3>
              <p className="text-sm text-[#6B675F] leading-relaxed pt-2">
                Setiap objek dalam katalog ruang arsitektural kami dirancang untuk meminimalkan distraksi sensori. Kayu ek padat berpelapis minyak alami, sambungan baja mentah, dan kain katun murni yang menghasilkan karakter menawan seiring waktu penggunaan.
              </p>
            </div>

            {/* Supporting Offset Framed Visual */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-2">
                <div className="aspect-square overflow-hidden bg-[#ECE6D8]">
                  <img
                    src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80"
                    alt="Keyboard Mekanikal & Perangkat Studio"
                    className="w-full h-full object-cover editorial-image-hover"
                  />
                </div>
                <p className="font-mono text-[10px] text-[#6B675F] pt-2">GMB. 03 — PERANGKAT STUDIO</p>
              </div>

              <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-2">
                <div className="aspect-square overflow-hidden bg-[#ECE6D8]">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
                    alt="Instrumen Keseharian Presisi"
                    className="w-full h-full object-cover editorial-image-hover"
                  />
                </div>
                <p className="font-mono text-[10px] text-[#6B675F] pt-2">GMB. 04 — INSTRUMEN PRESI</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/shop?category=home-living"
                className="inline-flex items-center gap-3 bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] border border-[#171717] hover:border-[#F4512A] px-7 py-3.5 text-xs font-mono uppercase tracking-widest transition-colors"
              >
                <span>Jelajahi Seri Ini</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
