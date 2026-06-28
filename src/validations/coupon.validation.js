import { z } from "zod";

// Create Coupon    

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .optional(),

    description: z
      .string()
      .trim()
      .max(300)
      .optional(),

    type: z.enum([
      "percentage",
      "fixed",
    ]),

    value: z
      .number()
      .positive(),

    minimumOrderAmount: z
      .number()
      .min(0)
      .optional(),

    maximumDiscount: z
      .number()
      .min(0)
      .nullable()
      .optional(),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),

    usageLimit: z
      .number()
      .int()
      .positive()
      .nullable()
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === "percentage" &&
      data.value > 100
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message:
          "Percentage discount cannot exceed 100.",
      });
    }

    if (
      data.endDate <= data.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message:
          "End date must be after start date.",
      });
    }

    if (
      data.type === "fixed" &&
      data.maximumDiscount != null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maximumDiscount"],
        message:
          "Fixed coupons cannot have a maximum discount.",
      });
    }
  });

// Update Coupon

export const updateCouponSchema =
  createCouponSchema.partial();

// Update Coupon Status

export const updateCouponStatusSchema =
  z.object({
    isActive: z.boolean(),
  });

// Validate Coupon

export const validateCouponSchema =
  z.object({
    code: z
      .string()
      .trim()
      .min(1),

    orderAmount: z
      .number()
      .min(0),
  });