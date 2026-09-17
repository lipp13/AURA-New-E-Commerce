// src/utils/imageCompressor.js
// Client-side image compression utility using HTML5 Canvas
// Automatically resizes large images and compresses to WebP / JPEG without visible quality loss

/**
 * Format bytes to readable string (e.g. 1.2 MB or 340 KB)
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Compress an image file using browser Canvas
 * @param {File|Blob} file The raw image file from user's gallery / device
 * @param {object} options Configuration options
 * @param {number} [options.maxWidth=1200] Maximum width in pixels
 * @param {number} [options.maxHeight=1200] Maximum height in pixels
 * @param {number} [options.quality=0.82] Output quality (0 to 1)
 * @param {string} [options.outputType='image/webp'] MIME type: 'image/webp' or 'image/jpeg'
 * @returns {Promise<{ file: File, dataUrl: string, originalSize: number, compressedSize: number, originalFormatted: string, compressedFormatted: string, savingsPercent: number }>}
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    outputType = 'image/webp',
  } = options;

  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Berkas yang dipilih harus berupa gambar (JPG, PNG, WEBP).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Gagal memproses berkas gambar.'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio-preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Tidak dapat membuat konteks kanvas untuk kompresi gambar.'));
          return;
        }

        // Draw image with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal mengompres gambar.'));
              return;
            }

            // Create compressed File object with proper name and extension
            const originalName = file.name || 'image';
            const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            const extension = outputType === 'image/webp' ? 'webp' : 'jpg';
            const compressedFileName = `${baseName}_compressed.${extension}`;

            const compressedFile = new File([blob], compressedFileName, {
              type: outputType,
              lastModified: Date.now(),
            });

            // Convert to dataURL for instant local preview
            const dataUrl = canvas.toDataURL(outputType, quality);

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const savingsPercent = Math.max(
              0,
              Math.round(((originalSize - compressedSize) / originalSize) * 100)
            );

            resolve({
              file: compressedFile,
              dataUrl,
              originalSize,
              compressedSize,
              originalFormatted: formatBytes(originalSize),
              compressedFormatted: formatBytes(compressedSize),
              savingsPercent,
              width,
              height,
            });
          },
          outputType,
          quality
        );
      };

      img.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  });
}
