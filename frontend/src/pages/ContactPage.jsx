import React, { useState } from 'react';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../context/ToastContext';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Pesan pertanyaan Anda telah diteruskan ke meja bantuan kami.', 'success');
  };

  return (
    <div className="pt-24 pb-24 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
      <Breadcrumb items={[{ label: 'Meja Bantuan Studio' }]} />

      <div className="border-b border-[#D8D2C6] pb-8 space-y-3">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B675F] block">
          [Layanan Pelanggan &amp; Konsultasi]
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#171717]">
          Meja Bantuan Studio
        </h1>
        <p className="font-mono text-xs text-[#6B675F] max-w-lg leading-relaxed">
          Pertanyaan seputar pesanan khusus, penawaran harga arsitektural, dan jadwal pengiriman ditangani langsung oleh spesialis kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Inquiry Form */}
        <div className="lg:col-span-7 border border-[#D8D2C6] bg-[#FAF8F2] p-8 sm:p-12 space-y-6">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#171717] border-b border-[#D8D2C6] pb-4">
            Kirimkan Pesan Komunikasi
          </h2>

          {submitted ? (
            <div className="p-6 border border-[#171717] bg-[#F5F1E8] font-mono text-xs text-[#171717] space-y-2">
              <p className="font-bold uppercase">[Pesan Terkirim]</p>
              <p className="text-[#6B675F]">Terima kasih. Spesialis AURA akan membalas pesan Anda dalam 2 jam kerja.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nama Depan" required placeholder="Nama depan Anda" />
                <Input label="Nama Belakang" required placeholder="Nama belakang Anda" />
              </div>
              <Input label="Alamat Email" type="email" required placeholder="nama@domain.com" />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium tracking-widest text-[#6B675F] uppercase font-mono">
                  Isi Pesan
                </label>
                <textarea
                  rows="5"
                  required
                  placeholder="Tuliskan detail pertanyaan Anda mengenai objek, pesanan, atau konsultasi desain..."
                  className="w-full bg-[#FAF8F2] border border-[#D8D2C6] text-[#171717] placeholder-[#A09A8E] p-4 text-xs font-mono tracking-wide focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" fullWidth size="lg">
                  Kirimkan Pesan Pertanyaan →
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Studio Locations & Direct Lines */}
        <div className="lg:col-span-5 space-y-8 font-mono text-xs">
          <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-8 space-y-6">
            <span className="text-[11px] uppercase tracking-widest text-[#F4512A] font-bold block">
              [Atelier &amp; Studio]
            </span>

            <div className="space-y-4 border-b border-[#D8D2C6] pb-6">
              <h3 className="font-display text-lg font-bold text-[#171717] uppercase">Kantor Pusat Milano</h3>
              <p className="text-[#6B675F] leading-relaxed">
                Via Montenapoleone 8<br />
                20121 Milan, Italia<br />
                Senin — Jumat, 09:00 — 18:00 CET
              </p>
              <p className="text-[#171717] font-bold">concierge@aura.design</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-[#171717] uppercase">Studio Riset Stockholm</h3>
              <p className="text-[#6B675F] leading-relaxed">
                Birger Jarlsgatan 14<br />
                114 34 Stockholm, Swedia<br />
                Senin — Jumat, 10:00 — 17:00 CET
              </p>
              <p className="text-[#171717] font-bold">stockholm@aura.design</p>
            </div>
          </div>

          <div className="border border-[#D8D2C6] bg-[#FAF8F2] p-6 space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-[#6B675F] block">[Saluran Telepon Langsung]</span>
            <p className="text-base font-bold text-[#171717]">+39 02 889 102</p>
            <p className="text-[#6B675F] text-[11px]">Layanan bantuan pelanggan internasional bebas pulsa</p>
          </div>
        </div>
      </div>
    </div>
  );
};
