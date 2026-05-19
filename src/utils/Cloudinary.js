import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ApiError } from './ApiError.js';

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log('local path', localFilePath);
    if (!localFilePath) return null;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error('CLOUDINARY ERROR:', error); // MUST log

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    throw new ApiError(500, 'Cloudinary upload failed');
  }
};

export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // extract public_id from URL
    const parts = imageUrl.split("/");
    const fileWithExt = parts.pop();
    const publicId = fileWithExt.split(".")[0];

    const folder = parts.slice(parts.indexOf("upload") + 1).join("/");

    const fullPublicId = folder ? `${folder}/${publicId}` : publicId;

    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new ApiError(500, "Failed to delete image from Cloudinary");
  }
};

