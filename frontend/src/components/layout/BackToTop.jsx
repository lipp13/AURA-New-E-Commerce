import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useSmoothScroll } from '../common/SmoothScrollProvider';

export const BackToTop = () => {
  const [show, setShow] = useState(false);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 400) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const handleScrollToTop = () => {
    scrollTo(0);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] border border-[#171717] hover:border-[#F4512A] shadow-lg transition-colors group"
          aria-label="Kembali ke atas halaman"
          title="Kembali ke atas"
        >
          <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
