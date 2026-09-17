import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../common/Button';

export const ConsentBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('aura_privacy_accepted');
      if (!accepted) {
        const timer = setTimeout(() => setShow(true), 2500);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('aura_privacy_accepted', 'true');
    } catch (e) {}
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm z-40 p-5 sm:p-6 bg-[#FAF8F2] border border-[#D8D2C6] space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-[#D8D2C6] pb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#171717] font-semibold">
              [Privasi &amp; Preferensi]
            </span>
            <button
              onClick={() => setShow(false)}
              className="text-[#6B675F] hover:text-[#171717]"
              aria-label="Tutup pemberitahuan privasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#6B675F] leading-relaxed">
            Kami menggunakan preferensi esensial untuk menjaga pengalaman kurasi Anda dan sinkronisasi status keranjang belanja.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={handleAccept} fullWidth>
              Setujui
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShow(false)} fullWidth>
              Tolak
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
