import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-16 py-6 border-t border-[#D8D2C6] overflow-x-auto no-scrollbar">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-[#D8D2C6] bg-[#FAF8F2] text-[#171717] hover:border-[#171717] disabled:opacity-30 disabled:hover:border-[#D8D2C6] transition-colors flex-shrink-0"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {pages.map((p, idx) => (
        <button
          key={idx}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          disabled={p === '...'}
          className={`w-8 h-8 sm:w-10 sm:h-10 font-mono text-[11px] sm:text-xs font-bold transition-colors flex-shrink-0 ${
            p === currentPage
              ? 'bg-[#171717] text-[#F5F1E8] border border-[#171717]'
              : p === '...'
              ? 'cursor-default text-[#6B675F] border-transparent'
              : 'border border-[#D8D2C6] bg-[#FAF8F2] text-[#171717] hover:border-[#171717]'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-[#D8D2C6] bg-[#FAF8F2] text-[#171717] hover:border-[#171717] disabled:opacity-30 disabled:hover:border-[#D8D2C6] transition-colors flex-shrink-0"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};
