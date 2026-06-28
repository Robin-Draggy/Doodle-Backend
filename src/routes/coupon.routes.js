import { Router } from "express";

import {
  createCoupon,
  deleteCoupon,
  getActiveCoupons,
  getCouponById,
  getCoupons,
  updateCoupon,
  updateCouponStatus,
  validateCoupon,
} from "../controllers/coupon.controller.js";

import { verify } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.check.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";

import {
  createCouponSchema,
  updateCouponSchema,
  updateCouponStatusSchema,
  validateCouponSchema,
} from "../validations/coupon.validation.js";

export const router = Router();


router.post(
  "/validate",
  verify,
  validate(validateCouponSchema),
  validateCoupon
);

router.get(
  "/active",
  getActiveCoupons
);



router
  .route("/")
  .get(
    verify,
    authorize("admin"),
    getCoupons
  )
  .post(
    verify,
    authorize("admin"),
    validate(createCouponSchema),
    createCoupon
  );

router
  .route("/:couponId")
  .get(
    verify,
    authorize("admin"),
    validateObjectId("couponId"),
    getCouponById
  )
  .put(
    verify,
    authorize("admin"),
    validateObjectId("couponId"),
    validate(updateCouponSchema),
    updateCoupon
  )
  .delete(
    verify,
    authorize("admin"),
    validateObjectId("couponId"),
    deleteCoupon
  );

router.patch(
  "/:couponId/status",
  verify,
  authorize("admin"),
  validateObjectId("couponId"),
  validate(updateCouponStatusSchema),
  updateCouponStatus
);