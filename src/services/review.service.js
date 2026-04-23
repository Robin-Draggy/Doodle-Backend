import mongoose from "mongoose";
import { Product } from "../models/product.model";
import { redis } from "../utils/Redis";
import { Review } from "../models/review.model";

export const addReviewService = async (userId, productId, data) => {
  const review = await Review.create({
    user: userId,
    product: productId,
    ...data
  });

  // recalc ratings
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) }},
    {
      $group: {
        _id: "$product",
        avg: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratings: {
      average: stats[0]?.avg || 0,
      count: stats[0]?.count || 0
    }
  });

  await redis.del(`product:${productId}`);

  return review;
};