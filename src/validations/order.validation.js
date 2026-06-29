import { z } from "zod";

// Create Order Validation Schema

export const createOrderSchema = z.object({
  addressId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid address ID."),

  couponCode: z
    .string()
    .trim()
    .min(1)
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

// Order Status

export const updateOrderStatusSchema =
  z.object({
    orderStatus: z.enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ]),
  });

// Payment Status

export const updatePaymentStatusSchema =
  z.object({
    paymentStatus: z.enum([
      "pending",
      "paid",
      "failed",
      "refunded",
    ]),
  });