import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import { ApiFeatures } from "../utils/ApiFeatures.js";
import { ApiError } from "../utils/ApiError.js";

import {
  aggregateProductRatingsRepo,
  findReviewByUserAndProductRepo,
  updateReviewStatusRepo,
} from "../repositories/review.repository.js";

// Update Product Ratings

const updateProductRatings = async (productId) => {
  const [ratings] = await aggregateProductRatingsRepo(productId);

  if (!ratings) {
    await Product.findByIdAndUpdate(productId, {
      ratings: {
        average: 0,
        count: 0,
        breakdown: {
          oneStar: 0,
          twoStar: 0,
          threeStar: 0,
          fourStar: 0,
          fiveStar: 0,
        },
      },
    });

    return;
  }

  await Product.findByIdAndUpdate(productId, {
    ratings: {
      average: Number(ratings.average.toFixed(1)),
      count: ratings.count,
      breakdown: {
        oneStar: ratings.oneStar,
        twoStar: ratings.twoStar,
        threeStar: ratings.threeStar,
        fourStar: ratings.fourStar,
        fiveStar: ratings.fiveStar,
      },
    },
  });
};

// Get Reviews

export const getReviewService = async (queryString) => {
  const baseQuery = Review.find()
    .populate("user", "username avatar")
    .populate("product", "title slug");

  const features = new ApiFeatures(baseQuery, queryString)
    .filter()
    .sort()
    .paginate();

  const total = await features.query.clone().countDocuments();

  const reviews = await features.query.lean();

  const page = Number(queryString.page) || 1;
  const limit = Number(queryString.limit) || 10;

  return {
    data: reviews,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get Review By ID

export const getReviewByIdService = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate("user", "username avatar")
    .populate("product", "title slug")
    .lean();

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  return review;
};

// Create Review

export const createReviewService = async (userId, data) => {
  const existingReview =
    await findReviewByUserAndProductRepo(
      userId,
      data.product
    );

  if (existingReview) {
    throw new ApiError(
      400,
      "You have already reviewed this product."
    );
  }

  const review = await Review.create({
    ...data,
    user: userId,
  });

  await updateProductRatings(data.product);

  return review;
};

// Update Review

export const updateReviewService = async (
  reviewId,
  userId,
  data
) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to update this review."
    );
  }

  Object.assign(review, data);

  review.isEdited = true;

  await review.save();

  await updateProductRatings(review.product);

  return review;
};

// Delete Review

export const deleteReviewService = async (
  reviewId,
  userId,
  role
) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  if (
    review.user.toString() !== userId.toString() &&
    role !== "admin"
  ) {
    throw new ApiError(
      403,
      "You are not allowed to delete this review."
    );
  }

  const productId = review.product;

  await review.deleteOne();

  await updateProductRatings(productId);

  return review;
};

// Update Review Status

export const updateReviewStatusService = async (
  reviewId,
  status
) => {
  const review = await updateReviewStatusRepo(
    reviewId,
    status
  );

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  return review;
};