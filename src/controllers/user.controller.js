import {
  loginUserService,
  logoutUserService,
  registerUserService,
} from '../services/user.service.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { cookieOptions } from '../utils/cookieOptions.js';

export const registerUser = AsyncHandler(async (req, res) => {
  const user = await registerUserService(req.body, req.file);

  return res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
});

export const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password required');
  }

  const { user, accessToken, refreshToken } = await loginUserService(email, password);

  res
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(
      new ApiResponse(200, 'Login successful', {
        user,
        accessToken,
      })
    );
});

export const logoutUser = AsyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  await logoutUserService(userId);

  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .status(200)
    .json(new ApiResponse(200, 'Logout successful'));
});
