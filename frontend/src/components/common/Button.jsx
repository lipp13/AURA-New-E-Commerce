import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.99] text-xs tracking-wider uppercase';

  const variants = {
    primary: 'bg-[#171717] text-[#F5F1E8] hover:bg-[#F4512A] border border-[#171717] hover:border-[#F4512A]',
    secondary: 'bg-[#FAF8F2] text-[#171717] hover:bg-[#ECE6D8] border border-[#D8D2C6]',
    outline: 'bg-transparent text-[#171717] border border-[#171717] hover:bg-[#171717] hover:text-[#F5F1E8]',
    ghost: 'bg-transparent text-[#171717] hover:text-[#F4512A]',
    accent: 'bg-[#F4512A] text-white hover:bg-[#DE401B] border border-[#F4512A]',
    danger: 'bg-rose-700 text-white hover:bg-rose-800 border border-rose-700',
    glass: 'bg-[#FAF8F2] text-[#171717] hover:bg-[#ECE6D8] border border-[#D8D2C6]',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-[11px] gap-1.5',
    md: 'px-6 py-3 text-xs gap-2',
    lg: 'px-8 py-4 text-xs gap-2.5 tracking-widest',
    icon: 'p-2.5 text-xs',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
