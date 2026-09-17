/**
 * Format standard success response
 */
export function successResponse(res, message, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Format standard error response
 */
export function errorResponse(res, message = 'Internal Server Error', error = null, statusCode = 500) {
  const responseBody = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV !== 'production' && error) {
    responseBody.error = typeof error === 'string' ? error : (error.message || error);
  }

  return res.status(statusCode).json(responseBody);
}

/**
 * Format standard validation error response
 */
export function validationResponse(res, errors = {}, message = 'Validation failed') {
  return res.status(422).json({
    success: false,
    message,
    errors,
  });
}
