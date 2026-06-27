import {
  createReviewService,
  deleteReviewService,
  getReviewByIdService,
  getReviewService,
  updateReviewService,
  updateReviewStatusService,
} from "../services/review.service.js";

import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  uploadImages,
  rollbackUploadedImages,
} from "../utils/cloudinaryFiles.js";

import { PARSE_JSON_FIELD } from "../config/constants.js";


// GET REVIEWS

export const getReviews = AsyncHandler(async (req, res) => {
  const reviews = await getReviewService(req.query);

  res.status(200).json(
    new ApiResponse(200, reviews, "Reviews fetched successfully.")
  );
});

// GET REVIEW BY ID

export const getReviewById = AsyncHandler(async (req, res) => {
  const review = await getReviewByIdService(req.params.reviewId);

  res.status(200).json(
    new ApiResponse(200, review, "Review fetched successfully.")
  );
});

// CREATE REVIEW

export const createReview = AsyncHandler(async (req, res) => {
  const files = req.files || [];

  let uploadedImages = [];

  try {
    uploadedImages = await uploadImages(files);

    const review = await createReviewService(req.user._id, {
      ...req.body,
      images: uploadedImages,
    });

    res.status(201).json(
      new ApiResponse(201, review, "Review created successfully.")
    );
  } catch (error) {
    await rollbackUploadedImages(uploadedImages);
    throw error;
  }
});

// Update Review

export const updateReview = AsyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const files = req.files || [];

  let uploadedImages = [];

  try {
    uploadedImages = await uploadImages(files);

    const updatedReview = await updateReviewService(
      reviewId,
      req.user._id,
      {
        ...req.body,
        uploadedImages,
        removeImages: PARSE_JSON_FIELD(req.body.removeImages),
      }
    );

    res.status(200).json(
      new ApiResponse(
        200,
        updatedReview,
        "Review updated successfully."
      )
    );
  } catch (error) {
    await rollbackUploadedImages(uploadedImages);
    throw error;
  }
});

// Delete Review

export const deleteReview = AsyncHandler(async (req, res) => {
  await deleteReviewService(
    req.params.reviewId,
    req.user._id,
    req.user.role
  );

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Review deleted successfully."
    )
  );
});

// Update Review Status (Admin Only)

export const updateReviewStatus = AsyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { status } = req.body;

  if (!["published", "hidden"].includes(status)) {
    throw new ApiError(400, "Invalid review status.");
  }

  const review = await updateReviewStatusService(
    reviewId,
    status
  );

  res.status(200).json(
    new ApiResponse(
      200,
      review,
      `Review ${status} successfully.`
    )
  );
});