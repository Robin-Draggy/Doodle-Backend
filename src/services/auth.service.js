import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import {
  createUserRepo,
  deleteUserRepo,
  findUserByEmailRepo,
  findUserByEmailVerificationTokenRepo,
  findUserByIdRepo,
  findUserByRefreshTokenRepo,
  findUserByResetPasswordTokenRepo,
  removeRefreshTokenRepo,
  saveUserRepo,
  updatePasswordRepo,
  updateRefreshTokenRepo,
  updateUserRepo,
} from '../repositories/user.repository.js';

import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.js';
import { sendEmail } from '../utils/SendEmail.js';

/* =====================================================
   Private Helpers
===================================================== */

/**
 * Generate new Access & Refresh Tokens
 */
const generateAccessAndRefreshTokens = async (userId) => {
  const user = await findUserByIdRepo(userId, '+refreshToken');

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  await updateRefreshTokenRepo(userId, refreshToken);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Upload avatar if provided.
 */
const uploadAvatar = async (file) => {
  if (!file) {
    return '';
  }

  const uploaded = await uploadOnCloudinary(file);

  if (!uploaded?.url) {
    throw new ApiError(500, 'Failed to upload avatar.');
  }

  return uploaded.url;
};

/**
 * Send verification email.
 *
 * Runs in the background.
 */
const sendVerificationEmail = (user, verificationToken) => {
  const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${verificationToken}`;

  sendEmail({
    to: user.email,
    subject: 'Verify your Doodle account',
    text: `Welcome to Doodle!

Please verify your email by clicking the link below:

${verificationUrl}

This link expires in 1 hour.`,
  }).catch((error) => {
    console.error('Verification email failed:', error);
  });
};

/**
 * Send password reset email.
 */
const sendPasswordResetEmail = (user, resetToken) => {
  const resetUrl = `${process.env.BASE_URL}/api/v1/auth/reset-password/${resetToken}`;

  sendEmail({
    to: user.email,
    subject: 'Reset your Doodle password',
    text: `We received a request to reset your password.

Click the link below:

${resetUrl}

This link expires in 15 minutes.

If you didn't request this, simply ignore this email.`,
  }).catch((error) => {
    console.error('Password reset email failed:', error);
  });
};

/**
 * Hash raw token before DB lookup.
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify refresh token.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }
};

/* =====================================================
   Register User
===================================================== */

export const registerUserService = async (userData, file) => {
  const { username, email, password } = userData;
  console.log("register user service",file)

  const existingUser = await findUserByEmailRepo(email);

  if (existingUser) {
    throw new ApiError(409, 'Email is already registered.');
  }

  const avatar = await uploadAvatar(file);

  const user = await createUserRepo({
    username,
    email,
    password,
    avatar,
    role: 'user',
  });

  const verificationToken = user.generateEmailVerificationToken();

  await saveUserRepo(user);

  sendVerificationEmail(user, verificationToken);

  return await findUserByIdRepo(user._id);
};

/* =====================================================
   Login User
===================================================== */

export const loginUserService = async (email, password) => {
  const user = await findUserByEmailRepo(email);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your email before logging in.');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  user.password = undefined;
  user.refreshToken = undefined;

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/* =====================================================
   Logout User
===================================================== */

export const logoutUserService = async (userId) => {
  const user = await findUserByIdRepo(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  await removeRefreshTokenRepo(userId);

  return;
};

/* =====================================================
   Refresh Access Token
===================================================== */

export const refreshAccessTokenService = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required.');
  }

  // Verify JWT
  const decoded = verifyRefreshToken(incomingRefreshToken);

  // Find user
  const user = await findUserByIdRepo(decoded._id, '+refreshToken');

  if (!user) {
    throw new ApiError(401, 'Invalid refresh token.');
  }

  // Check against the token stored in DB
  if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is invalid.');
  }

  // Rotate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  return {
    accessToken,
    refreshToken,
  };
};

/* =====================================================
   Verify Email
===================================================== */

export const verifyEmailService = async (verificationToken) => {
  if (!verificationToken) {
    throw new ApiError(400, 'Verification token is required.');
  }

  const hashedToken = hashToken(verificationToken);

  const user = await findUserByEmailVerificationTokenRepo(hashedToken);

  if (!user) {
    throw new ApiError(400, 'Verification link is invalid or has expired.');
  }

  if (user.isVerified) {
    throw new ApiError(400, 'Email is already verified.');
  }

  user.isVerified = true;

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  await saveUserRepo(user);

  return {
    message: 'Email verified successfully.',
  };
};

/* =====================================================
   Resend Verification Email
===================================================== */

export const resendVerificationEmailService = async (email) => {
  const user = await findUserByEmailRepo(email, '+emailVerificationToken');

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (user.isVerified) {
    throw new ApiError(400, 'Email is already verified.');
  }

  const verificationToken = user.generateEmailVerificationToken();

  await saveUserRepo(user);

  sendVerificationEmail(user, verificationToken);

  return {
    message: 'Verification email has been sent.',
  };
};

/* =====================================================
   Forgot Password
===================================================== */

export const forgotPasswordService = async (email) => {
  const user = await findUserByEmailRepo(email, '+resetPasswordToken');

  /**
   * Do NOT reveal whether the email exists.
   *
   * Prevents user enumeration attacks.
   */
  if (!user) {
    return {
      message: 'If an account exists with this email, a password reset link has been sent.',
    };
  }

  const resetToken = user.generateResetPasswordToken();

  await saveUserRepo(user);

  sendPasswordResetEmail(user, resetToken);

  return {
    message: 'If an account exists with this email, a password reset link has been sent.',
  };
};

/* =====================================================
   Reset Password
===================================================== */

export const resetPasswordService = async (token, newPassword) => {
  if (!token) {
    throw new ApiError(400, 'Reset token is required.');
  }

  const hashedToken = hashToken(token);

  const user = await findUserByResetPasswordTokenRepo(hashedToken);

  if (!user) {
    throw new ApiError(400, 'Reset link is invalid or has expired.');
  }

  await updatePasswordRepo(user, newPassword);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  /**
   * Optional Security Improvement
   *
   * Force logout from every device
   * after password reset.
   */
  user.refreshToken = undefined;

  await saveUserRepo(user);

  return {
    message: 'Password has been reset successfully.',
  };
};

/* =====================================================
   Change Password
===================================================== */

export const changePasswordService = async (userId, currentPassword, newPassword) => {
  const user = await findUserByIdRepo(userId, '+password +refreshToken');

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  const isSamePassword = await user.isPasswordCorrect(newPassword);

  if (isSamePassword) {
    throw new ApiError(400, 'New password must be different from the current password.');
  }

  await updatePasswordRepo(user, newPassword);

  // Log out all devices after password change
  user.refreshToken = undefined;

  await saveUserRepo(user);

  return {
    message: 'Password changed successfully. Please log in again.',
  };
};
