import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/auth.controller.js";

import { verify } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  registerUserSchema,
  loginUserSchema,
  refreshTokenSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validations/auth.validation.js";

import { loginLimiter } from "../utils/loginLimiter.js";

export const router = Router();

/* =====================================================
   Public Routes
===================================================== */

router.post(
  "/register",
  upload.single("avatar"),
  validate(registerUserSchema),
  registerUser
);

router.get(
  "/verify-email/:token",
  verifyEmail
);

router.post(
  "/resend-verification-email",
  validate(resendVerificationSchema),
  resendVerificationEmail
);

router.post(
  "/login",
  loginLimiter,
  validate(loginUserSchema),
  loginUser
);

router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  refreshAccessToken
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword
);

/* =====================================================
   Protected Routes
===================================================== */

router.post(
  "/logout",
  verify,
  logoutUser
);

router.post(
  "/change-password",
  verify,
  validate(changePasswordSchema),
  changePassword
);
