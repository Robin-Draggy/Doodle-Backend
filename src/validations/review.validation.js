import { z } from "zod";
import { REVIEW_STATUS } from "../utils/constants.js";

// Create Review

export const createReviewSchema = z.object({
  product: z
    .string()
    .trim()
    .length(24, "Invalid product id"),

  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),

  title: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .optional(),

  comment: z
    .string()
    .trim()
    .min(3)
    .max(2000),

  status: z
    .enum(REVIEW_STATUS)
    .optional(),

  removeImages: z.string().optional(),
});

// Update Review

export const updateReviewSchema = createReviewSchema
  .omit({
    product: true,
  })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message:
        "At least one field is required to update.",
    }
  );