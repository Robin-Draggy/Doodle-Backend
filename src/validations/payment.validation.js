import { z } from "zod";


const paymentGatewayEnum = z.enum([
  "cash_on_delivery",
  "stripe",
  "sslcommerz",
  "bkash",
  "nagad",
]);


export const createPaymentSchema = z.object({
  orderId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid order ID."),

  gateway: paymentGatewayEnum,
});

export const verifyPaymentSchema = z.object({
  paymentReference: z
    .string()
    .trim()
    .min(5, "Payment reference is required."),
});

export const refundPaymentSchema = z.object({
  refundAmount: z
    .number({
      invalid_type_error:
        "Refund amount must be a number.",
    })
    .positive("Refund amount must be greater than 0."),

  reason: z
    .string()
    .trim()
    .min(5, "Refund reason is required.")
    .max(500),
});