import { getProfileService, updateProfileService } from '../services/user.service.js';

import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/* =====================================================
   Get Current User Profile
===================================================== */

export const getProfile = AsyncHandler(async (req, res) => {
  const user = await getProfileService(req.user._id);

  return res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully.'));
});

/* =====================================================
   Update Current User Profile
===================================================== */

export const updateProfile = AsyncHandler(async (req, res) => {
  const user = await updateProfileService(req.user._id, req.body, req.file);

  return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully.'));
});
