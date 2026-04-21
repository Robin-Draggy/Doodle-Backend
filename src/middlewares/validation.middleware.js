import { ApiError } from '../utils/ApiError.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    return next();
  } catch (error) {
    console.log("validation middleware",error.errors);
    return next(new ApiError(400, 'Validation error', error.errors));
  }
};
