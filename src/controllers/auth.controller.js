import {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  verifyEmailService,
  resendVerificationEmailService,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService,
} from '../services/auth.service.js';

import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/* =====================================================
   Cookie Options
===================================================== */

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* =====================================================
   Register
===================================================== */

export const registerUser = AsyncHandler(async (req, res) => {
  const user = await registerUserService(req.body, req.file);

  return res
    .status(201)
    .json(new ApiResponse(201, user, 'Registration successful. Please verify your email.'));
});

/* =====================================================
   Login
===================================================== */

export const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUserService(email, password);

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user,
          accessToken,
          refreshToken,
        },
        'Logged in successfully.'
      )
    );
});

/* =====================================================
   Logout
===================================================== */

export const logoutUser = AsyncHandler(async (req, res) => {
  await logoutUserService(req.user._id);

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, null, 'Logged out successfully.'));
});

/* =====================================================
   Refresh Token
===================================================== */

export const refreshAccessToken = AsyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  const { accessToken, refreshToken } = await refreshAccessTokenService(incomingRefreshToken);

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
        },
        'Token refreshed successfully.'
      )
    );
});

/* =====================================================
   Verify Email
===================================================== */

export const verifyEmail = AsyncHandler(async (req, res) => {
  const { token } = req.params;

  const result = await verifyEmailService(token);
  
  return res.status(200).json(new ApiResponse(200, result, result.message));
});

// when frontend is built
/* ----
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  await verifyEmailService(token);

  return res.redirect(
    `${process.env.FRONTEND_URL}/login?verified=true`
  );
});
*/

/* =====================================================
   Resend Verification Email
===================================================== */

export const resendVerificationEmail = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await resendVerificationEmailService(email);

  return res.status(200).json(new ApiResponse(200, result, result.message));
});

/* =====================================================
   Forgot Password
===================================================== */

export const forgotPassword = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await forgotPasswordService(email);

  return res.status(200).json(new ApiResponse(200, result, result.message));
});

/* =====================================================
   Reset Password
===================================================== */

export const resetPassword = AsyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const result = await resetPasswordService(token, password);

  return res.status(200).json(new ApiResponse(200, result, result.message));
});

/* =====================================================
   Change Password
===================================================== */

export const changePassword = AsyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await changePasswordService(req.user._id, currentPassword, newPassword);

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, result, result.message));
});
