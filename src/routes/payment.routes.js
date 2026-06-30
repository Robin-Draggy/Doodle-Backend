import { Router } from "express";

import {
  createPayment,
  verifyPayment,
  getMyPayments,
  getPaymentById,
  getPaymentsByOrder,
  getAllPayments,
  refundPayment,
  paymentWebhook,
} from "../controllers/payment.controller.js";

import {
  createPaymentSchema,
  refundPaymentSchema,
  verifyPaymentSchema,
} from "../validations/payment.validation.js";

import { verify } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.check.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

export const router = Router();

/* ======================================
   Webhooks
   (No JWT Required)
====================================== */

router.post(
  "/webhook/:gateway",
  paymentWebhook
);

/* ======================================
   Protected Routes
====================================== */

router.use(verify);

/* ======================================
   Customer Routes
====================================== */

router.post(
  "/",
  validate(createPaymentSchema),
  createPayment
);

router.post(
  "/verify",
  validate(verifyPaymentSchema),
  verifyPayment
);

router.get(
  "/me",
  getMyPayments
);

router.get(
  "/order/:orderId",
  getPaymentsByOrder
);

router.get(
  "/:paymentId",
  getPaymentById
);

/* ======================================
   Admin Routes
====================================== */

router.get(
  "/",
  authorize("admin"),
  getAllPayments
);

router.post(
  "/:paymentId/refund",
  authorize("admin"),
  validate(refundPaymentSchema),
  refundPayment
);
