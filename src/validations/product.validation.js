import { z } from "zod";
import { PRODUCT_STATUS } from "../config/constants.js";

const specificationSchema = z.object({
  key: z.string().trim().min(1, "Specification key is required"),
  value: z.string().trim().min(1, "Specification value is required"),
});

export const createProductSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(200),

    description: z.string().trim().optional(),

    brand: z.string().trim().optional(),

    category: z.string().trim().min(1, "Category is required"),

    price: z.coerce.number().min(0),

    discountPrice: z.coerce.number().min(0).nullable().optional(),

    stock: z.coerce.number().int().min(0).optional(),

    lowStockThreshold: z.coerce.number().int().min(0).optional(),

    status: z
      .string()
      .refine((value) => PRODUCT_STATUS.includes(value), {
        message: "Status must be one of: draft, published, archived",
      })
      .optional(),

    isFeatured: z.coerce.boolean().optional(),

    tags: z.union([
      z.array(z.string().trim()),
      z.string(),
    ]).optional(),

    specifications: z.union([
      z.array(specificationSchema),
      z.string(),
    ]).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.discountPrice !== undefined &&
      data.discountPrice !== null &&
      data.discountPrice >= data.price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountPrice"],
        message: "Discount price must be less than the original price.",
      });
    }
  });

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });