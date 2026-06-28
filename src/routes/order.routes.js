import { Router } from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
} from "../controllers/order.controller.js";

import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "../validations/order.validation.js";

import { validate } from "../middlewares/validation.middleware.js";
import { verify } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.check.middleware.js";

export const router = Router();

// Customer Routes

router.use(verify);

router.post(
  "/",
  validate(createOrderSchema),
  createOrder
);

router.get("/", getMyOrders);

router.get("/:orderId", getOrderById);

router.patch(
  "/:orderId/cancel",
  cancelOrder
);

// Admin Routes

router.get(
  "/admin",
  authorize("admin"),
  getAllOrders
);

router.patch(
  "/:orderId/status",
  authorize("admin"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

router.patch(
  "/:orderId/payment",
  authorize("admin"),
  validate(updatePaymentStatusSchema),
  updatePaymentStatus
);

export default router;