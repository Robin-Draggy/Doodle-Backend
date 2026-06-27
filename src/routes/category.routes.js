import { Router } from "express";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
} from "../controllers/category.controller.js";

import { verify } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.check.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/category.validation.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";

export const router = Router();

// CATEGORY ROUTES

router
  .route("/")
  .get(getCategories)
  .post(
    verify,
    authorize("admin"),
    upload.single("image"),
    validate(createCategorySchema),
    createCategory
  );

// CATEGORY BY ID

router
  .route("/:categoryId")
  .get(
    validateObjectId("categoryId"),
    getCategoryById
  )
  .put(
    verify,
    authorize("admin"),
    validateObjectId("categoryId"),
    upload.single("image"),
    validate(updateCategorySchema),
    updateCategory
  );

// UPDATE CATEGORY STATUS

router.patch(
  "/:categoryId/status",
  verify,
  authorize("admin"),
  validateObjectId("categoryId"),
  updateCategoryStatus
);