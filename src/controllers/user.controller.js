import {
  addAddressService,
  getProfileService,
  loginUserService,
  logoutUserService,
  registerUserService,
  removeAddressService,
  updateAddressService,
  updateProfileService,
} from '../services/user.service.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { cookieOptions } from '../utils/cookieOptions.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendEmail } from '../utils/SendEmail.js';

export const registerUser = AsyncHandler(async (req, res) => {
  const user = await registerUserService(req.body, req.file);

  return res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
});

export const verifyEmail = AsyncHandler(async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, null, "Email verified successfully")
  );
});

export const forgotPassword = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const token = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.BASE_URL}/api/v1/users/reset-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    text: `Reset your password: ${resetUrl}`,
  });

  res.status(200).json(
    new ApiResponse(200, null, "Password reset link sent to email")
  );
});

export const resetPassword = AsyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  user.password = password; // will be hashed by pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, "Password reset successful")
  );
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

export const getProfile = AsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await getProfileService(userId);

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Profile fetched successfully"
    )
  )
})

export const updateProfile = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const data = req.body;
  const file = req.file;

  const user = await updateProfileService(userId, data, file)

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Profile updated successfully"
    )
  )
})

export const addAddress = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const address = req.body;

  const user = await addAddressService(userId, address)

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Address added successfully"
    )
  )
})

export const updateAddress = AsyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user._id;
  const data = req.body;

  const user = await updateAddressService(userId, addressId, data)

  res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Address updated successfully"
    )
  )

})

export const removeAddress = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
  throw new ApiError(400, "Invalid address ID");
}

  const user = await removeAddressService(userId, addressId)

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Address removed successfully"
    )
  )
})