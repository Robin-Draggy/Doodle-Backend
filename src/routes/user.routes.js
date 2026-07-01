import { Router } from "express";

import {
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";

import { verify } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  updateProfileSchema,
} from "../validations/user.validation.js";

export const router = Router();

/* =====================================================
   Protected Routes
===================================================== */

router.get(
  "/me",
  verify,
  getProfile
);

router.patch(
  "/me",
  verify,
  upload.single("avatar"),
  validate(updateProfileSchema),
  updateProfile
);
