import { User } from '../models/user.model.js';

// Find a user by email and include password and refreshToken fields

export const findUserByEmail = (email) => {
  return User.findOne({ email }).select('+password +refreshToken');
};

// Create a new user in the database

export const createUser = (data) => {
  return User.create(data);
};

// Update the refresh token for a user

export const updateRefreshToken = (userId, token) => {
  return User.findByIdAndUpdate(userId, { refreshToken: token }, { returnDocument: 'after' });
};

// Remove the refresh token for a user

export const removeRefreshToken = (userId) => {
  return User.findByIdAndUpdate(userId, { $unset: { refreshToken: '' } });
};

// Find a user by ID and exclude password and refreshToken fields

export const findUserById = (id) => {
  return User.findById(id).select('-password -refreshToken');
};

// Update a user's profile by ID and return the updated user without password and refreshToken fields

export const updateUser = (id, data) => {
  return User.findByIdAndUpdate(id, data, {
    new: true,
  }).select('-password -refreshToken');
};
