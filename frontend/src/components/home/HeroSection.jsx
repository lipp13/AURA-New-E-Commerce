import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-36 md:pb-24 border-b border-[#D8D2C6] bg-[#F5F1E8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Top Editorial Eyebrow */}
        <div className="flex items-center justify-between border-b border-[#D8D2C6] pb-4 mb-8 sm:mb-12">
          <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[#6B675F]">
            [01 — ARSIP DESAIN KURASI]
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B675F] hidden md:inline">
            AURA / RISET MATERIAL &amp; KOMERSIAL
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F4512A] animate-pulse" />
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[#171717] font-semibold">
              Katalog Aktif
            </span>
          </div>
        </div>

        {/* Hero Content: Monumental Editorial Typography without collisions */}
        <div className="pb-10 sm:pb-14 border-b border-[#D8D2C6]">
          <h1 className="font-display text-[2.2rem] xs:text-[2.65rem] sm:text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[8rem] font-extrabold tracking-tight text-[#171717] leading-[0.92] uppercase select-none">
            BENTUK
            <br />
            MONOLITIK.
            <br />
            <span className="text-[#F4512A]">OBJEK</span>
            <br />
            KESEHARIAN.
          </h1>
        </div>

        {/* Sub-Hero Editorial Bar: Clean Description & High-End Action Buttons */}
        <div className="pt-8 sm:pt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs sm:text-sm font-mono text-[#6B675F] leading-relaxed max-w-xl">
              Kurasi objek kehidupan keseharian dengan kejujuran material, ketepatan rekayasa industri, dan keindahan fungsional tanpa batas waktu.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center lg:justify-end gap-3 sm:gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-3 bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] border border-[#171717] hover:border-[#F4512A] px-7 py-4 text-xs font-mono uppercase tracking-widest transition-all duration-200"
            >
              <span>Jelajahi Katalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-3 bg-[#FAF8F2] text-[#171717] hover:bg-[#ECE6D8] border border-[#D8D2C6] px-7 py-4 text-xs font-mono uppercase tracking-widest transition-colors"
            >
              <span>Manifesto Studio</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
