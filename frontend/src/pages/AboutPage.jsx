import React from 'react';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="pt-24 pb-28 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-20">
      <Breadcrumb items={[{ label: 'Manifesto Studio' }]} />

      {/* Hero Manifesto Header */}
      <div className="border-b border-[#D8D2C6] pb-12 space-y-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Manifesto &amp; Filosofi Studio]
        </span>
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-[#171717] leading-[1.02] max-w-5xl">
          Bentuk Mengikuti Fungsi. Objek yang Dirancang Melampaui Generasi.
        </h1>
        <p className="font-mono text-xs sm:text-sm text-[#6B675F] max-w-2xl leading-relaxed">
          Didirikan di Milan dan Stockholm, AURA berlandaskan pada satu keyakinan kokoh: bahwa objek kehidupan keseharian harus dibebaskan dari kebisingan pemasaran dan dikalibrasi dengan ketepatan rekayasa industri.
        </p>
      </div>

      {/* Large Framed Studio Photography */}
      <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-3 sm:p-5">
        <div className="aspect-[21/9] overflow-hidden bg-[#ECE6D8]">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85"
            alt="Studio Arsitektural AURA"
            className="w-full h-full object-cover editorial-image-hover"
          />
        </div>
        <div className="pt-3 flex justify-between items-baseline font-mono text-[11px] text-[#6B675F]">
          <span>ATELIER MILANO — RISET RUANG ARSITEKTURAL</span>
          <span>DOKUMENTASI 2026</span>
        </div>
      </div>

      {/* Core Principles: Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-[#D8D2C6] pb-20">
        <div className="space-y-4 border-t border-[#D8D2C6] pt-6">
          <span className="font-mono text-xs text-[#F4512A] font-bold block">
            [01 / METROLOGI]
          </span>
          <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
            Presisi Tanpa Kompromi
          </h3>
          <p className="text-xs text-[#6B675F] leading-relaxed">
            Setiap radius sudut, sasis aluminium beranodisasi, dan respon sentuhan kain selvedge divalidasi hingga toleransi milimeter. Kami menguji setiap spesimen demi keseimbangan akustik, struktural, dan mekanis jangka panjang.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#D8D2C6] pt-6">
          <span className="font-mono text-xs text-[#F4512A] font-bold block">
            [02 / SIRKULARITAS]
          </span>
          <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
            Materialitas Abadi
          </h3>
          <p className="text-xs text-[#6B675F] leading-relaxed">
            Kami menolak siklus keusangan terencana. Karya kami memanfaatkan mono-material yang dapat didaur ulang seutuhnya, rute logistik ramah karbon, dan komponen modular yang dirancang untuk diperbaiki, bukan dibuang.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#D8D2C6] pt-6">
          <span className="font-mono text-xs text-[#F4512A] font-bold block">
            [03 / JAMINAN MUTU]
          </span>
          <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#171717]">
            Layanan Resmi Studio
          </h3>
          <p className="text-xs text-[#6B675F] leading-relaxed">
            Setiap pesanan dilengkapi garansi resmi minimal 2 tahun serta masa evaluasi 30 hari. Kami menjamin integritas rekayasa dari setiap objek berstempel AURA.
          </p>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-6">
        <div>
          <h4 className="font-display text-2xl font-bold uppercase tracking-tight text-[#171717]">
            Rasakan Pengalaman Arsip Permanen
          </h4>
          <p className="font-mono text-xs text-[#6B675F] mt-1">
            Koleksi objek pilihan dalam beragam disiplin fungsi siap dikirim ke seluruh penjuru dunia.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-3 bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] border border-[#171717] hover:border-[#F4512A] px-8 py-4 text-xs font-mono uppercase tracking-widest transition-colors"
        >
          <span>Jelajahi Katalog Objek</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
