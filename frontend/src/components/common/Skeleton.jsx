import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-[#ECE6D8] border border-[#D8D2C6] ${className}`}
      {...props}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="w-full aspect-[4/5]" />
      <div className="flex justify-between items-center mt-1">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-12 h-3" />
      </div>
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-16 h-4" />
    </div>
  );
};
