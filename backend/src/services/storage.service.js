import { supabaseAdmin } from '../config/supabase.js';
import crypto from 'crypto';
import path from 'path';

export const BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  PAYMENT_PROOFS: 'payment-proofs',
  CHAT_ATTACHMENTS: 'chat-attachments',
  STORE_ASSETS: 'store-assets',
};

/**
 * Upload a file buffer to a Supabase Storage bucket
 * @param {string} bucketName
 * @param {Express.Multer.File} file
 * @param {string} folderPrefix
 * @returns {Promise<{ storagePath: string, publicUrl: string }>}
 */
export async function uploadBufferToStorage(bucketName, file, folderPrefix = '') {
  if (!file || !file.buffer) {
    throw new Error('File buffer is required for upload.');
  }

  const ext = path.extname(file.originalname) || '.jpg';
  const randomName = crypto.randomBytes(16).toString('hex');
  const fileName = `${randomName}${ext}`;
  const storagePath = folderPrefix ? `${folderPrefix.replace(/\/$/, '')}/${fileName}` : fileName;

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    console.error(`Supabase Storage Upload Error (${bucketName}):`, error);
    throw new Error(`Gagal mengunggah berkas ke storage: ${error.message}`);
  }

  // Generate public URL (for public buckets)
  const { data: publicData } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: publicData?.publicUrl || '',
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  };
}

/**
 * Get signed URL for private bucket files
 */
export async function getSignedFileUrl(bucketName, storagePath, expiresIn = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    console.error('Create Signed URL Error:', error);
    return null;
  }

  return data?.signedUrl || null;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFileFromStorage(bucketName, storagePath) {
  if (!storagePath) return false;

  const { error } = await supabaseAdmin.storage
    .from(bucketName)
    .remove([storagePath]);

  if (error) {
    console.warn(`Failed to delete file ${storagePath} from ${bucketName}:`, error.message);
    return false;
  }

  return true;
}
