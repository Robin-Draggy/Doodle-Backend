import { z } from "zod";
import { CATEGORY_STATUS } from "../config/constants.js";


const seoSchema = z.object({
  title: z
    .string()
    .trim()
    .max(60, "SEO title cannot exceed 60 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(160, "SEO description cannot exceed 160 characters")
    .optional(),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .optional(),

  parent: z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent category id")
  .optional(),

  isFeatured: z
    .coerce
    .boolean()
    .optional(),

  status: z
    .enum(CATEGORY_STATUS)
    .optional(),

  sortOrder: z
    .coerce
    .number()
    .int()
    .min(0)
    .optional(),

  seo: z
    .union([
      seoSchema,
      z.string(), // multipart/form-data
    ])
    .optional(),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update.",
  });