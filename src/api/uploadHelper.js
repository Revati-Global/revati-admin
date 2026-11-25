import { api } from './client';

export const PRESET_CONFIGS = {
  logo: { maxWidth: 400, maxHeight: 400, maxBytes: 80 * 1024, initialQuality: 0.8 },
  partner: { maxWidth: 400, maxHeight: 400, maxBytes: 80 * 1024, initialQuality: 0.8 },
  avatar: { maxWidth: 256, maxHeight: 256, maxBytes: 60 * 1024, initialQuality: 0.8 },
  thumbnail: { maxWidth: 600, maxHeight: 600, maxBytes: 120 * 1024, initialQuality: 0.78 },
  product: { maxWidth: 1000, maxHeight: 1000, maxBytes: 220 * 1024, initialQuality: 0.78 },
  project: { maxWidth: 1000, maxHeight: 1000, maxBytes: 220 * 1024, initialQuality: 0.78 },
  blog: { maxWidth: 1200, maxHeight: 1200, maxBytes: 250 * 1024, initialQuality: 0.78 },
  banner: { maxWidth: 1600, maxHeight: 1200, maxBytes: 380 * 1024, initialQuality: 0.75 },
  svg: { maxBytes: 50 * 1024 },
  pdf: { maxBytes: 10 * 1024 * 1024 }
};

/**
 * Resizes and converts an image File to a WebP Blob within size/dimension constraints.
 */
export async function compressImageToWebp(file, preset = 'product') {
  // If SVG or PDF, do not canvas compress
  if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
    const config = PRESET_CONFIGS[preset] || { maxBytes: 10 * 1024 * 1024 };
    if (file.size > config.maxBytes) {
      throw new Error(`File size (${Math.round(file.size / 1024)} KB) exceeds ${preset} limit of ${Math.round(config.maxBytes / 1024)} KB`);
    }
    return file;
  }

  const config = PRESET_CONFIGS[preset] || PRESET_CONFIGS.product;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image data for conversion'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale maintaining aspect ratio
        if (width > config.maxWidth || height > config.maxHeight) {
          const ratio = Math.min(config.maxWidth / width, config.maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let quality = config.initialQuality || 0.8;

        const attemptCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error('Canvas WebP encoding failed'));
              }
              // If blob exceeds limit and quality can be reduced (down to 0.60)
              if (blob.size > config.maxBytes && quality > 0.60) {
                quality = Math.max(0.60, quality - 0.05);
                attemptCompression();
              } else {
                const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
                const compressedFile = new File([blob], cleanName, { type: 'image/webp' });
                resolve(compressedFile);
              }
            },
            'image/webp',
            quality
          );
        };

        attemptCompression();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Direct signed upload helper:
 * 1. Compress image to WebP client-side
 * 2. Request signed upload token from backend
 * 3. Directly PUT file bytes to Supabase Storage signed URL
 * 4. Confirm upload with backend verification
 *
 * @param {File} rawFile
 * @param {string} preset 'logo'|'avatar'|'thumbnail'|'product'|'project'|'blog'|'banner'|'svg'|'pdf'
 * @param {Function} [onProgress] (percent: number) => void
 * @returns {Promise<{ path: string, publicUrl: string }>}
 */
export async function directUploadFile(rawFile, preset = 'product', onProgress = () => {}) {
  if (!rawFile) throw new Error('No file provided for upload');

  onProgress(10);

  // 1. Client-side compression
  const preparedFile = await compressImageToWebp(rawFile, preset);
  onProgress(30);

  // 2. Obtain signed upload token
  const signRes = await api.post('/admin/uploads/sign', {
    preset,
    filename: preparedFile.name,
    contentType: preparedFile.type,
    size: preparedFile.size
  });

  if (signRes.data.result !== 'success') {
    throw new Error(signRes.data.message || 'Failed to obtain upload authorization');
  }

  const { signedUrl, path: storagePath, publicUrl } = signRes.data;
  onProgress(50);

  // 3. Direct upload to Supabase via fetch / PUT
  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': preparedFile.type,
      'Cache-Control': 'max-age=31536000'
    },
    body: preparedFile
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text().catch(() => '');
    throw new Error(`Direct storage upload failed (${uploadResponse.status}): ${errorText || 'Network error'}`);
  }
  onProgress(85);

  // 4. Server-side confirmation & dimension/size verification
  const confirmRes = await api.post('/admin/uploads/confirm', {
    path: storagePath,
    preset
  });

  if (confirmRes.data.result !== 'success') {
    throw new Error(confirmRes.data.message || 'File verification failed on storage backend');
  }

  onProgress(100);

  return {
    path: storagePath,
    publicUrl: confirmRes.data.publicUrl || publicUrl
  };
}
