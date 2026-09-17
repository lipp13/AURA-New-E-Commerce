import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: 'bg-[#FAF8F2] text-[#6B675F] border border-[#D8D2C6]',
    primary: 'bg-[#171717] text-[#F5F1E8] border border-[#171717]',
    bestseller: 'bg-[#FAF8F2] text-[#171717] border border-[#171717]',
    new: 'bg-[#FAF8F2] text-[#171717] border border-[#D8D2C6]',
    sale: 'bg-[#F4512A] text-white border border-[#F4512A]',
    shipping: 'bg-[#FAF8F2] text-[#6B675F] border border-[#D8D2C6]',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
};
