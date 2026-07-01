import jwt from 'jsonwebtoken';

import { findUserByIdRepo } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';

export const verify = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized.');
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await findUserByIdRepo(decoded._id);

    if (!user) {
      throw new ApiError(401, 'User not found.');
    }

    req.user = user;

    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, 'Invalid or expired token.'));
  }
};
