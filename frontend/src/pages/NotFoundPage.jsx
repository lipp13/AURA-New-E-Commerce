import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="pt-40 pb-32 max-w-xl mx-auto px-6 text-center space-y-6">
      <span className="font-mono text-xs uppercase tracking-widest text-[#F4512A] font-bold block">[Galat 404]</span>
      <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#171717]">
        Halaman Tidak Ditemukan
      </h1>
      <p className="font-mono text-xs text-[#6B675F] max-w-sm mx-auto leading-relaxed">
        Entri arsip katalog atau halaman studio yang Anda minta tidak tersedia atau telah dipindahkan.
      </p>
      <div className="flex justify-center gap-3 pt-4">
        <Link to="/">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Beranda Studio
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="secondary">
            Jelajahi Katalog
          </Button>
        </Link>
      </div>
    </div>
  );
};
