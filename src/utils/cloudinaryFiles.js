import { uploadOnCloudinary, deleteFromCloudinary } from './Cloudinary.js';

/**
 * Upload multiple files to Cloudinary.
 *
 * @param {Array} files
 * @returns {Promise<Array>}
 */
export const uploadImages = async (files = []) => {
  return Promise.all(
    files.map(async (file) => {
      const uploaded = await uploadOnCloudinary(file);

      return {
        url: uploaded.url,
        public_id: uploaded.public_id,
      };
    })
  );
};

/**
 * Delete multiple images from Cloudinary.
 *
 * @param {Array} images
 */
export const deleteImages = async (images = []) => {
  if (!images.length) return;

  await Promise.all(images.map((image) => deleteFromCloudinary(image.public_id)));
};

/**
 * Roll back uploaded images if a later operation fails.
 *
 * Uses Promise.allSettled so every delete is attempted.
 *
 * @param {Array} images
 */
export const rollbackUploadedImages = async (images = []) => {
  if (!images.length) return;

  await Promise.allSettled(images.map((image) => deleteFromCloudinary(image.public_id)));
};
