import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-[11px] font-medium tracking-widest text-[#6B675F] uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[#6B675F] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          className={`w-full bg-[#FAF8F2] border border-[#D8D2C6] text-[#171717] placeholder-[#A09A8E] px-4 py-3 text-xs tracking-wide transition-colors focus:outline-none focus:border-[#171717] focus:bg-white ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-rose-600' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-[11px] text-rose-600 mt-0.5 tracking-wide">{error}</span>}
    </div>
  );
};
