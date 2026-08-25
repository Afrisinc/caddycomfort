"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBase64FileType = exports.isValidBase64Image = exports.getOptimizedImageUrl = exports.deleteMultipleImages = exports.deleteImage = exports.uploadBufferImage = exports.uploadMultipleBase64Images = exports.uploadBase64Image = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Upload base64 image to Cloudinary
 */
const uploadBase64Image = async (base64String, options) => {
    try {
        const result = await cloudinary_1.v2.uploader.upload(base64String, {
            folder: options?.folder || 'clementine-shop',
            transformation: options?.transformation,
            format: options?.format,
            public_id: options?.public_id,
        });
        return result.secure_url;
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};
exports.uploadBase64Image = uploadBase64Image;
/**
 * Upload multiple base64 images to Cloudinary
 */
const uploadMultipleBase64Images = async (base64Strings, options) => {
    try {
        const uploadPromises = base64Strings.map((base64) => (0, exports.uploadBase64Image)(base64, options));
        return await Promise.all(uploadPromises);
    }
    catch (error) {
        console.error('Cloudinary multiple upload error:', error);
        throw new Error(`Failed to upload images: ${error.message}`);
    }
};
exports.uploadMultipleBase64Images = uploadMultipleBase64Images;
/**
 * Upload buffer image to Cloudinary
 */
const uploadBufferImage = async (buffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: options?.folder || 'clementine-shop',
            transformation: options?.transformation,
            format: options?.format,
            public_id: options?.public_id,
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary buffer upload error:', error);
                reject(new Error(`Failed to upload image: ${error.message}`));
            }
            else {
                resolve(result.secure_url);
            }
        });
        const readableStream = new stream_1.Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};
exports.uploadBufferImage = uploadBufferImage;
/**
 * Delete image from Cloudinary by URL
 */
const deleteImage = async (imageUrl) => {
    try {
        // Extract public_id from Cloudinary URL
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        await cloudinary_1.v2.uploader.destroy(`${folder}/${publicId}`);
    }
    catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};
exports.deleteImage = deleteImage;
/**
 * Delete multiple images from Cloudinary
 */
const deleteMultipleImages = async (imageUrls) => {
    try {
        const deletePromises = imageUrls.map((url) => (0, exports.deleteImage)(url));
        await Promise.all(deletePromises);
    }
    catch (error) {
        console.error('Cloudinary multiple delete error:', error);
        throw new Error(`Failed to delete images: ${error.message}`);
    }
};
exports.deleteMultipleImages = deleteMultipleImages;
/**
 * Get optimized image URL with transformations
 */
const getOptimizedImageUrl = (imageUrl, options) => {
    if (!imageUrl.includes('cloudinary.com')) {
        return imageUrl;
    }
    const { width, height, quality = 'auto', format = 'auto' } = options || {};
    const transformations = [];
    if (width)
        transformations.push(`w_${width}`);
    if (height)
        transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    const transformString = transformations.join(',');
    return imageUrl.replace('/upload/', `/upload/${transformString}/`);
};
exports.getOptimizedImageUrl = getOptimizedImageUrl;
/**
 * Validate base64 image string
 */
const isValidBase64Image = (base64String) => {
    const regex = /^data:image\/(png|jpg|jpeg|gif|webp|svg\+xml);base64,/;
    return regex.test(base64String);
};
exports.isValidBase64Image = isValidBase64Image;
/**
 * Extract file type from base64 string
 */
const getBase64FileType = (base64String) => {
    const match = base64String.match(/^data:image\/([a-zA-Z+]+);base64,/);
    return match ? match[1] : null;
};
exports.getBase64FileType = getBase64FileType;
exports.default = cloudinary_1.v2;
