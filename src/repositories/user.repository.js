import { User } from '../models/user.model.js';

/* ======================================
   Create
====================================== */

export const createUserRepo = (userData) => {
  return User.create(userData);
};

/* ======================================
   Find
====================================== */

export const findUserByIdRepo = (userId, select = '-password -refreshToken') => {
  return User.findById(userId).select(select);
};

export const findUserByEmailRepo = (email, select = '+password +refreshToken') => {
  return User.findOne({
    email: email.toLowerCase(),
  }).select(select);
};

export const findUserByRefreshTokenRepo = (refreshToken) => {
  return User.findOne({
    refreshToken,
  }).select('+refreshToken');
};

export const findUserByEmailVerificationTokenRepo = (token) => {
  return User.findOne({
    emailVerificationToken: token,
    emailVerificationExpiry: {
      $gt: new Date(),
    },
  });
};

export const findUserByResetPasswordTokenRepo = (token) => {
  return User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: {
      $gt: new Date(),
    },
  }).select('+password');
};

/* ======================================
   Update
====================================== */

export const updateUserRepo = (userId, updateData) => {
  return User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-password -refreshToken');
};

export const updateRefreshTokenRepo = (userId, refreshToken) => {
  return User.findByIdAndUpdate(
    userId,
    {
      refreshToken,
    },
    {
      new: true,
    }
  ).select('+refreshToken');
};

export const removeRefreshTokenRepo = (userId) => {
  return User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: '',
      },
    },
    {
      new: true,
    }
  );
};

export const updatePasswordRepo = async (user, newPassword) => {
  user.password = newPassword;

  return user;
};

/* ======================================
   Save
====================================== */

export const saveUserRepo = (user) => {
  return user.save({
    validateBeforeSave: false,
  });
};

/* ======================================
   Delete
====================================== */

export const deleteUserRepo = (userId) => {
  return User.findByIdAndDelete(userId);
};
