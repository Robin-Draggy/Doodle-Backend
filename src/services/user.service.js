import {
  findUserByIdRepo,
  updateUserRepo,
  deleteUserRepo,
} from '../repositories/user.repository.js';

import { uploadOnCloudinary } from '../utils/Cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

/* =====================================================
   Get Profile
===================================================== */

export const getProfileService = async (userId) => {
  const user = await findUserByIdRepo(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return user;
};

/* =====================================================
   Update Profile
===================================================== */

export const updateProfileService = async (userId, data, file) => {
  const user = await findUserByIdRepo(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const updateData = {};

  if (data.username !== undefined) {
    updateData.username = data.username;
  }

  if (file) {
    const uploaded = await uploadOnCloudinary(file);

    if (!uploaded?.url) {
      throw new ApiError(500, 'Avatar upload failed.');
    }

    updateData.avatar = uploaded.url;
  }

  const updatedUser = await updateUserRepo(userId, updateData);

  return updatedUser;
};

/* =====================================================
   Delete Account
===================================================== */

export const deleteAccountService = async (userId) => {
  const user = await findUserByIdRepo(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  await deleteUserRepo(userId);

  return {
    message: 'Account deleted successfully.',
  };
};
