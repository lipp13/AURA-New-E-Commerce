import React from 'react';
import { Link } from 'react-router-dom';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center text-[11px] font-mono uppercase tracking-widest text-[#6B675F] py-2">
      <Link to="/" className="hover:text-[#F4512A] transition-colors">
        Beranda
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="mx-2 text-[#D8D2C6]">/</span>
          {item.link ? (
            <Link to={item.link} className="hover:text-[#F4512A] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#171717] font-bold truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
