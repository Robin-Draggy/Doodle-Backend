import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const verify = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return next(new ApiError(401, "User not found"));
    }

    req.user = user; 
    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid token"));
  }
};