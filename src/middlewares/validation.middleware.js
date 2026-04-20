import { ApiError } from '../utils/ApiError.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });
    return next();
  } catch (error) {
    console.log(error.errors);
    return next(new ApiError(400, 'Validation error', error.errors));
  }
};
