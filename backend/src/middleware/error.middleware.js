import { errorResponse } from '../utils/response.js';

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  return errorResponse(res, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`, null, 404);
}

/**
 * Global Error Handler Middleware
 */
export function globalErrorHandler(err, req, res, next) {
  console.error('🔥 Global Exception:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  return errorResponse(res, message, err, statusCode);
}
