import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware.js';
import { addressSchema, registerUserSchema } from '../validations/user.validation.js';
import {
  forgotPassword,
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateProfile,
  verifyEmail,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verify } from '../middlewares/auth.middleware.js';
import { loginLimiter } from '../utils/loginLimiter.js';

export const router = Router();

router.route('/register').post(upload.single('avatar'), validate(registerUserSchema), registerUser);
router.route('/verify-email/:token').get(verifyEmail);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').post(resetPassword);
router.route('/login').post(loginLimiter, loginUser);
router.route('/logout').post(verify, logoutUser);
router.route('/profile').get(verify, getProfile);
router.route('/profile').patch(verify, upload.single('avatar'), updateProfile);
