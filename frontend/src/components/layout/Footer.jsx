import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-[#D8D2C6] bg-[#F5F1E8] text-[#171717] pt-20 pb-16">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Editorial Brand Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#D8D2C6]">
          <div className="lg:col-span-6 space-y-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B675F] block">
              Studio Editorial &amp; Riset Desain
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#171717] leading-[1.1]">
              OBJEK KEHIDUPAN. DIRANCANG DENGAN PRESISI.
            </h2>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <p className="text-sm text-[#6B675F] max-w-md leading-relaxed">
              Koleksi objek kurasi keseharian, ketepatan industri, dan kebudayaan material lintas waktu. Dirancang bagi kolektor, arsitek, dan penikmat desain murni.
            </p>

            <div className="flex flex-wrap gap-8 text-xs font-mono uppercase tracking-widest text-[#171717]">
              <span>[Pengiriman Nusantara &amp; Global]</span>
              <span>[Garansi Resmi 2 Tahun]</span>
              <span>[Jaminan Retur 30 Hari]</span>
            </div>
          </div>
        </div>

        {/* Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-b border-[#D8D2C6]">
          {/* Col 1: Katalog */}
          <div className="space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
              Katalog
            </span>
            <ul className="space-y-2.5 text-xs uppercase tracking-wider">
              <li><Link to="/shop?category=electronics" className="hover:text-[#F4512A] transition-colors">Elektronik</Link></li>
              <li><Link to="/shop?category=fashion" className="hover:text-[#F4512A] transition-colors">Busana</Link></li>
              <li><Link to="/shop?category=furniture" className="hover:text-[#F4512A] transition-colors">Furnitur</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-[#F4512A] transition-colors">Aksesoris</Link></li>
              <li><Link to="/shop" className="hover:text-[#F4512A] transition-colors font-bold">Semua Kategori →</Link></li>
            </ul>
          </div>

          {/* Col 2: Editorial */}
          <div className="space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
              Editorial
            </span>
            <ul className="space-y-2.5 text-xs uppercase tracking-wider">
              <li><Link to="/about" className="hover:text-[#F4512A] transition-colors">Kisah Studio</Link></li>
              <li><Link to="/about" className="hover:text-[#F4512A] transition-colors">Keahlian Artisan</Link></li>
              <li><Link to="/about" className="hover:text-[#F4512A] transition-colors">Keberlanjutan</Link></li>
              <li><Link to="/about" className="hover:text-[#F4512A] transition-colors">Arsip Desain</Link></li>
            </ul>
          </div>

          {/* Col 3: Layanan */}
          <div className="space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
              Layanan Pelanggan
            </span>
            <ul className="space-y-2.5 text-xs uppercase tracking-wider">
              <li><Link to="/dashboard" className="hover:text-[#F4512A] transition-colors">Status Pesanan</Link></li>
              <li><Link to="/contact" className="hover:text-[#F4512A] transition-colors">Pusat Bantuan</Link></li>
              <li><Link to="/contact" className="hover:text-[#F4512A] transition-colors">Pengiriman &amp; Retur</Link></li>
              <li><Link to="/compare" className="hover:text-[#F4512A] transition-colors">Bandingkan Objek</Link></li>
            </ul>
          </div>

          {/* Col 4: Studio */}
          <div className="space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B675F] block">
              Studio
            </span>
            <p className="text-xs text-[#6B675F] leading-relaxed">
              Dirancang &amp; Dikembangkan oleh <a href="https://github.com/lipp13" target="_blank" rel="noopener noreferrer" className="text-[#171717] font-bold underline hover:text-[#F4512A] transition-colors">Alif Alfathar</a>.
            </p>
            <div className="pt-2 flex flex-col space-y-2 text-xs uppercase tracking-wider">
              <a href="https://github.com/lipp13" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#F4512A] transition-colors">
                GitHub <ArrowUpRight className="w-3 h-3" />
              </a>
              <a href="https://www.linkedin.com/in/alif-alfathar-183402407/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#F4512A] transition-colors">
                LinkedIn <ArrowUpRight className="w-3 h-3" />
              </a>
              <a href="https://www.instagram.com/alfthrr13/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#F4512A] transition-colors">
                Instagram <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-baseline justify-between text-[11px] font-mono text-[#6B675F] gap-4">
          <p>© {new Date().getFullYear()} AURA / OBJEK. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6 uppercase tracking-wider">
            <Link to="/about" className="hover:text-[#171717] transition-colors">Ketentuan</Link>
            <Link to="/about" className="hover:text-[#171717] transition-colors">Privasi</Link>
            <Link to="/contact" className="hover:text-[#171717] transition-colors">Lokasi Studio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
