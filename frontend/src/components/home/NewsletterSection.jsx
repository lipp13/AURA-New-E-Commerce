import React, { useState } from 'react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    addToast('Pendaftaran berhasil. Anda akan menerima warta dan monograf studio.', 'success');
  };

  return (
    <section className="py-24 border-b border-[#D8D2C6] bg-[#FAF8F2]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-baseline">
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B675F] block">
              [Warta &amp; Riset Studio]
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#171717] leading-[1.08]">
              Dapatkan Monograf Triwulanan &amp; Rilis Arsip Terbatas.
            </h2>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs text-[#6B675F] max-w-md leading-relaxed font-mono">
              Bergabunglah dalam registri kami untuk mendapatkan undangan eksklusif ke peluncuran objek edisi terbatas, esai material, dan riset desain dari studio kami.
            </p>

            {subscribed ? (
              <div className="border border-[#171717] bg-[#F5F1E8] p-4 text-xs font-mono uppercase tracking-widest text-[#171717]">
                ✓ Anda telah terdaftar dalam registri warta studio.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  className="w-full bg-[#F5F1E8] border border-[#D8D2C6] text-[#171717] placeholder-[#8A8478] px-4 py-3 text-xs tracking-wider font-mono focus:outline-none focus:border-[#171717]"
                />
                <Button type="submit" size="md" className="flex-shrink-0">
                  Berlangganan
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
