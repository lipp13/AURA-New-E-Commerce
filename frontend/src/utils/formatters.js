// src/utils/formatters.js
// Utility helpers for formatting currency, numbers, and dates

/**
 * Formats price into standard Indonesian Rupiah (IDR)
 * Example: 279000 -> "Rp 279.000"
 */
export const formatPrice = (amount) => {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  return `Rp ${num.toLocaleString('id-ID')}`;
};
