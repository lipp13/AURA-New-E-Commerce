import { errorResponse } from '../utils/response.js';

/**
 * Require specific role(s) to access endpoint
 * @param  {...string} roles Allowed roles: 'user', 'seller', 'admin'
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Akses ditolak: Autentikasi diperlukan.', null, 401);
    }

    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      return errorResponse(
        res,
        `Akses ditolak: Anda tidak memiliki izin (${roles.join(' / ')}) untuk mengakses resource ini.`,
        null,
        403
      );
    }

    next();
  };
}

/**
 * Shortcut helper middlewares
 */
export const requireUser = requireRole('user');
export const requireSeller = requireRole('seller');
export const requireAdmin = requireRole('admin');
export const requireSellerOrAdmin = requireRole('seller', 'admin');
