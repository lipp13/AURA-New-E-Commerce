import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    document.body.style.overflow = '';
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.15 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/40"
        >
          {/* Modal Container */}
          <motion.div
            key="modal-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15, pointerEvents: 'none' }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${maxWidth} bg-[#FAF8F2] border border-[#D8D2C6] overflow-hidden z-10 my-8`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8D2C6]">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#171717]">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-[#6B675F] hover:text-[#171717] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {!title && (
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 text-[#6B675F] hover:text-[#171717] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="p-6 sm:p-8">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
