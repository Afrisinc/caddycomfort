import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder?: string;
  transformation?: any[];
  format?: string;
  public_id?: string;
}

/**
 * Upload base64 image to Cloudinary
 */
export const uploadBase64Image = async (
  base64String: string,
  options?: UploadOptions,
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: options?.folder || 'clementine-shop',
      transformation: options?.transformation,
      format: options?.format,
      public_id: options?.public_id,
    });

    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload multiple base64 images to Cloudinary
 */
export const uploadMultipleBase64Images = async (
  base64Strings: string[],
  options?: UploadOptions,
): Promise<string[]> => {
  try {
    const uploadPromises = base64Strings.map((base64) => uploadBase64Image(base64, options));

    return await Promise.all(uploadPromises);
  } catch (error: any) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

/**
 * Upload buffer image to Cloudinary
 */
export const uploadBufferImage = async (
  buffer: Buffer,
  options?: UploadOptions,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder || 'clementine-shop',
        transformation: options?.transformation,
        format: options?.format,
        public_id: options?.public_id,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary buffer upload error:', error);
          reject(new Error(`Failed to upload image: ${error.message}`));
        } else {
          resolve(result!.secure_url);
        }
      },
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary by URL
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = urlParts[urlParts.length - 2];

    await cloudinary.uploader.destroy(`${folder}/${publicId}`);
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 */
export const deleteMultipleImages = async (imageUrls: string[]): Promise<void> => {
  try {
    const deletePromises = imageUrls.map((url) => deleteImage(url));
    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error('Cloudinary multiple delete error:', error);
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

/**
 * Get optimized image URL with transformations
 */
export const getOptimizedImageUrl = (
  imageUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: string;
  },
): string => {
  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const { width, height, quality = 'auto', format = 'auto' } = options || {};

  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformString = transformations.join(',');
  return imageUrl.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * Validate base64 image string
 */
export const isValidBase64Image = (base64String: string): boolean => {
  const regex = /^data:image\/(png|jpg|jpeg|gif|webp|svg\+xml);base64,/;
  return regex.test(base64String);
};

/**
 * Extract file type from base64 string
 */
export const getBase64FileType = (base64String: string): string | null => {
  const match = base64String.match(/^data:image\/([a-zA-Z+]+);base64,/);
  return match ? match[1] : null;
};

export default cloudinary;
