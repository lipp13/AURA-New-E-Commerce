import multer from 'multer';
import { errorResponse } from '../utils/response.js';

// Memory storage for forwarding directly to Supabase Storage buffer
const storage = multer.memoryStorage();

// File filter: Only allow JPEG, PNG, WEBP images
function fileFilter(req, file, cb) {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak valid. Hanya JPG, JPEG, PNG, dan WEBP yang diperbolehkan.'), false);
  }
}

// Upload middleware for payment proofs (Max 3MB)
export const uploadPaymentProof = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter,
}).single('proof');

// Upload middleware for product images (Max 5MB)
export const uploadProductImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
}).single('image');

// Upload middleware for chat attachments (Max 5MB)
export const uploadChatAttachment = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
}).single('attachment');

// Upload middleware for store logo / avatar (Max 2MB)
export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter,
}).single('avatar');

/**
 * Wrapper to handle Multer errors gracefully
 */
export function handleUploadError(uploadFn) {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return errorResponse(res, 'Ukuran file terlalu besar.', err.message, 400);
        }
        return errorResponse(res, `Upload error: ${err.message}`, err, 400);
      } else if (err) {
        return errorResponse(res, err.message, err, 400);
      }
      next();
    });
  };
}
