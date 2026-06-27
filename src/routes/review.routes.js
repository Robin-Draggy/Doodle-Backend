import { Router } from "express";

import {
  createReview,
  deleteReview,
  getReviewById,
  getReviews,
  updateReview,
  updateReviewStatus,
} from "../controllers/review.controller.js";

import { verify } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.check.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

import { validate } from "../middlewares/validation.middleware.js";

import {
  createReviewSchema,
  updateReviewSchema,
} from "../validations/review.validation.js";

import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";

export const router = Router();

// GET ALL REVIEWS

router
  .route("/")
  .get(getReviews)
  .post(
    verify,
    upload.array("images", 5),
    validate(createReviewSchema),
    createReview
  );

// GET, UPDATE, DELETE REVIEW BY ID

router
  .route("/:reviewId")
  .get(
    validateObjectId("reviewId"),
    getReviewById
  )
  .put(
    verify,
    validateObjectId("reviewId"),
    upload.array("images", 5),
    validate(updateReviewSchema),
    updateReview
  )
  .delete(
    verify,
    validateObjectId("reviewId"),
    deleteReview
  );

// UPDATE REVIEW STATUS ONLY ADMIN

router.patch(
  "/:reviewId/status",
  verify,
  authorize("admin"),
  validateObjectId("reviewId"),
  updateReviewStatus
);