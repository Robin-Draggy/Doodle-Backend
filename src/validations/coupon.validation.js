import { z } from "zod";


const couponSchema = z.object({
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
});

// Validation Rules

const validateCouponRules = (
  data,
  ctx
) => {
  // Percentage coupon cannot exceed 100%
  if (
    data.type === "percentage" &&
    data.value !== undefined &&
    data.value > 100
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["value"],
      message:
        "Percentage discount cannot exceed 100.",
    });
  }

  // End date must be after start date
  if (
    data.startDate &&
    data.endDate &&
    data.endDate <= data.startDate
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message:
        "End date must be after start date.",
    });
  }

  // Fixed coupons shouldn't have maximumDiscount
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
};

// Create Coupon

export const createCouponSchema =
  couponSchema.superRefine(
    validateCouponRules
  );

// Update Coupon

export const updateCouponSchema =
  couponSchema
    .partial()
    .superRefine(
      validateCouponRules
    );

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