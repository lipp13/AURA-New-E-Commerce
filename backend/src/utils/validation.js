/**
 * Input validation helpers for backend controllers
 */

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s-]/g, '');
  // Format Indonesia: 08... atau +62... minimal 9 digit, maksimal 16 digit
  return /^(08|\+628|628)[0-9]{7,13}$/.test(cleaned);
}

export function isPositiveNumber(val) {
  const num = Number(val);
  return !isNaN(num) && num > 0;
}

export function isNonNegativeNumber(val) {
  const num = Number(val);
  return !isNaN(num) && num >= 0;
}

export function isUUID(str) {
  if (!str || typeof str !== 'string') return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(str);
}

export function sanitizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
}
