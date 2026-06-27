import { Review } from "../models/review.model.js";

// Create Review

export const createReviewRepo = (data) => {
  return Review.create(data);
};

// Find One Review

export const findReviewByIdRepo = (reviewId) => {
  return Review.findById(reviewId);
};

export const findReviewByIdLeanRepo = (reviewId) => {
  return Review.findById(reviewId).lean();
};

export const findReviewByUserAndProductRepo = (userId, productId) => {
  return Review.findOne({
    user: userId,
    product: productId,
  });
};

export const findReviewByUserAndProductLeanRepo = (
  userId,
  productId
) => {
  return Review.findOne({
    user: userId,
    product: productId,
  }).lean();
};

// Find Many Reviews

export const findReviewsRepo = (filter = {}) => {
  return Review.find(filter);
};

export const findReviewsLeanRepo = (filter = {}) => {
  return Review.find(filter).lean();
};

export const findProductReviewsRepo = (productId) => {
  return Review.find({
    product: productId,
    status: "published",
  });
};

export const findProductReviewsLeanRepo = (productId) => {
  return Review.find({
    product: productId,
    status: "published",
  }).lean();
};

export const findUserReviewsRepo = (userId) => {
  return Review.find({
    user: userId,
  });
};

export const findUserReviewsLeanRepo = (userId) => {
  return Review.find({
    user: userId,
  }).lean();
};

// Update Review

export const updateReviewRepo = (reviewId, data) => {
  return Review.findByIdAndUpdate(reviewId, data, {
    new: true,
    runValidators: true,
  });
};

// Delete Review

export const deleteReviewRepo = (reviewId) => {
  return Review.findByIdAndDelete(reviewId);
};

// Update Review Status

export const updateReviewStatusRepo = (
  reviewId,
  status
) => {
  return Review.findByIdAndUpdate(
    reviewId,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );
};


// Aggregate Product Ratings

export const aggregateProductRatingsRepo = (productId) => {
  return Review.aggregate([
    {
      $match: {
        product: productId,
        status: "published",
      },
    },
    {
      $group: {
        _id: "$product",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
        oneStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 1] }, 1, 0],
          },
        },
        twoStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 2] }, 1, 0],
          },
        },
        threeStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 3] }, 1, 0],
          },
        },
        fourStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 4] }, 1, 0],
          },
        },
        fiveStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 5] }, 1, 0],
          },
        },
      },
    },
  ]);
};