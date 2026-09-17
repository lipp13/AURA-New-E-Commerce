import crypto from 'crypto';

/**
 * Generate unique Order ID / Order Number
 * Format: ORD-<timestamp>-<6 alphanumeric chars>
 * Example: ORD-1726000000000-A8B9C2
 */
export function generateOrderNumber() {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${randomSuffix}`;
}
