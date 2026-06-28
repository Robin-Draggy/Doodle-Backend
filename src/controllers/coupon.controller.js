import {
  createCouponService,
  deleteCouponService,
  getActiveCouponsService,
  getCouponByIdService,
  getCouponsService,
  updateCouponService,
  updateCouponStatusService,
  validateCouponService,
} from "../services/coupon.service.js";

import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create Coupon

export const createCoupon = AsyncHandler(async (req, res) => {
  const coupon = await createCouponService(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      coupon,
      "Coupon created successfully."
    )
  );
});

// Get All Coupons

export const getCoupons = AsyncHandler(async (req, res) => {
  const coupons = await getCouponsService();

  res.status(200).json(
    new ApiResponse(
      200,
      coupons,
      "Coupons fetched successfully."
    )
  );
});

// Get Active Coupons

export const getActiveCoupons = AsyncHandler(async (req, res) => {
  const coupons = await getActiveCouponsService();

  res.status(200).json(
    new ApiResponse(
      200,
      coupons,
      "Active coupons fetched successfully."
    )
  );
});

// Get Coupon By ID

export const getCouponById = AsyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await getCouponByIdService(couponId);

  res.status(200).json(
    new ApiResponse(
      200,
      coupon,
      "Coupon fetched successfully."
    )
  );
});

// Update Coupon

export const updateCoupon = AsyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await updateCouponService(
    couponId,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      coupon,
      "Coupon updated successfully."
    )
  );
});

// Update Coupon Status

export const updateCouponStatus = AsyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new Error(
      "isActive must be either true or false."
    );
  }

  const coupon =
    await updateCouponStatusService(
      couponId,
      isActive
    );

  res.status(200).json(
    new ApiResponse(
      200,
      coupon,
      `Coupon ${
        isActive ? "activated" : "deactivated"
      } successfully.`
    )
  );
});

// Delete Coupon

export const deleteCoupon = AsyncHandler(async (req, res) => {
  const { couponId } = req.params;

  await deleteCouponService(couponId);

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Coupon deleted successfully."
    )
  );
});

// Validate Coupon

export const validateCoupon = AsyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  const result = await validateCouponService(
    code,
    orderAmount
  );

  res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Coupon validated successfully."
    )
  );
});