import { ApiError } from '../utils/ApiError.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const body = req.body || {}; // 👈 fallback
    req.body = schema.parse(body);
    return next();
  } catch (error) {
    console.log("validation middleware", error.issues);

    return next(
      new ApiError(
        400,
        error.issues?.[0]?.message || "Validation error",
        error.issues
      )
    );
  }
};