import React, { useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';

export const BrandLogos = () => {
  const { products } = useProducts();
  const { categories } = useCategories();

  // Dynamically extract real store names and categories from Supabase
  const items = useMemo(() => {
    const names = [];
    const sellers = [...new Set(products.map(p => p.brand).filter(Boolean))];
    sellers.forEach(s => names.push({ name: s }));
    categories.forEach(c => names.push({ name: c.name }));
    return names.length > 0 ? names : [{ name: 'Toko Elektronik Official' }, { name: 'Electronics' }, { name: 'Fashion' }, { name: 'Beauty' }];
  }, [products, categories]);

  const marqueeList = [...items, ...items, ...items];

  return (
    <section className="py-6 border-b border-[#D8D2C6] bg-[#FAF8F2] overflow-hidden">
      <div className="relative flex overflow-x-hidden no-scrollbar">
        <div className="flex gap-12 sm:gap-16 items-center whitespace-nowrap animate-marquee font-mono text-xs uppercase tracking-widest text-[#6B675F]">
          {marqueeList.map((item, idx) => (
            <div key={idx} className="flex items-center gap-12">
              <span className="hover:text-[#171717] transition-colors cursor-default font-bold text-[#171717]">
                {item.name}
              </span>
              <span className="text-[#D8D2C6] font-normal">/</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
