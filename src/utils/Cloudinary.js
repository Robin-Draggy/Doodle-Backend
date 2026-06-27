import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError.js";

// Configure Cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file buffer to Cloudinary
 */
export const uploadOnCloudinary = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new ApiError(400, "No file provided");
    }

    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "doodle/products",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            return reject(
              new ApiError(500, "Failed to upload image to Cloudinary")
            );
          }

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      stream.end(file.buffer);
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error instanceof ApiError
      ? error
      : new ApiError(500, "Cloudinary upload failed");
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw new ApiError(500, "Failed to delete image from Cloudinary");
  }
};