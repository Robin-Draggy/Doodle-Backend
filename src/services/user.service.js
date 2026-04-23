import { User } from "../models/user.model.js";
import {
  addAddress,
  findUserByEmail,
  findUserById,
  removeAddress,
  removeRefreshToken,
  updateAddress,
  updateRefreshToken,
  updateUser,
} from "../repositories/user.repository.js";

import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { redis } from "../utils/Redis.js";
import { sendEmail } from "../utils/SendEmail.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await findUserById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    console.log("user", user)

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await updateRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("TOKEN ERROR:", error);
    throw new ApiError(500, "Error generating tokens");
  }
};


export const registerUserService = async (data, file) => {
  const { username, email, password } = data;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields required");
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  let avatarUrl = "";

  if (file?.path) {
    const uploaded = await uploadOnCloudinary(file.path);
    avatarUrl = uploaded?.secure_url;
  }

  const user = await User.create({
    username,
    email,
    password,
    avatar: avatarUrl,
  });

  const token = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.BASE_URL}/api/v1/users/verify-email/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    text: `Click to verify: ${verifyUrl}`,
  });

  return await findUserById(user._id);
};


export const loginUserService = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) throw new ApiError(401, "User not found");

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } =
    await generateAccessAndRefereshTokens(user._id);

  return { user, accessToken, refreshToken };
};


export const logoutUserService = async (userId) => {
  await removeRefreshToken(userId);
};


export const getProfileService = async (userId) => {
  const cacheKey = `user:profile:${userId}`;

  const cachedUser = await redis.get(cacheKey);
  if (cachedUser) return JSON.parse(cachedUser);

  const user = await findUserById(userId);

  if (!user) throw new ApiError(404, "User not found");

  await redis.set(cacheKey, JSON.stringify(user), "EX", 3600);

  return user;
};


export const updateProfileService = async (userId, data, file) => {
  const updatedData = { ...data };

  if (file?.path) {
    const uploaded = await uploadOnCloudinary(file.path);
    updatedData.avatar = uploaded.secure_url;
  }

  const user = await updateUser(userId, updatedData);

  await redis.del(`user:profile:${userId}`);

  return user;
};


export const addAddressService = async (userId, address) => {
  if (address.isDefault) {
    await User.updateOne(
      { _id: userId },
      { $set: { "addresses.$[].isDefault": false } }
    );
  }

  return await addAddress(userId, address);
};


export const updateAddressService = async (userId, addressId, data) => {
  const user = await findUserById(userId);

  const duplicate = user.addresses.some(
    (addr) =>
      addr.addressLine === data.addressLine &&
      addr.city === data.city
  );

  if (duplicate) {
    throw new ApiError(400, "Address already exists");
  }

  if (data.isDefault) {
    await User.updateOne(
      { _id: userId },
      { $set: { "addresses.$[].isDefault": false } }
    );
  }

  return await updateAddress(userId, addressId, data);
};


export const removeAddressService = async (userId, addressId) => {
  return await removeAddress(userId, addressId);
};