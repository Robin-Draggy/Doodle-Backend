import crypto from 'crypto';

import {
  createCouponRepo,
  deleteCouponRepo,
  findActiveCouponsRepo,
  findCouponByCodeRepo,
  findCouponByIdLeanRepo,
  findCouponByIdRepo,
  findCouponsLeanRepo,
  updateCouponRepo,
} from '../repositories/coupon.repository.js';

import { ApiError } from '../utils/ApiError.js';
import { generateUniqueCouponCode } from '../config/helper.js';


// Create Coupon

export const createCouponService = async (data) => {
  if (!data.code) {
    data.code = await generateUniqueCouponCode();
  } else {
    data.code = data.code.trim().toUpperCase();

    const existingCoupon = await findCouponByCodeRepo(data.code);

    if (existingCoupon) {
      throw new ApiError(409, 'Coupon code already exists.');
    }
  }

  return await createCouponRepo(data);
};

// Get All Coupons

export const getCouponsService = async (filter = {}) => {
  return await findCouponsLeanRepo(filter);
};

// Get Active Coupons

export const getActiveCouponsService = async () => {
  return await findActiveCouponsRepo();
};

// Get Coupon By ID

export const getCouponByIdService = async (couponId) => {
  const coupon = await findCouponByIdLeanRepo(couponId);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  return coupon;
};

// Update Coupon

export const updateCouponService = async (couponId, data) => {
  const coupon = await findCouponByIdRepo(couponId);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  if (data.code) {
    data.code = data.code.trim().toUpperCase();

    const existingCoupon = await findCouponByCodeRepo(data.code);

    if (existingCoupon && existingCoupon._id.toString() !== couponId.toString()) {
      throw new ApiError(409, 'Coupon code already exists.');
    }
  }

  return await updateCouponRepo(couponId, data);
};

// Update Coupon Status

export const updateCouponStatusService = async (couponId, isActive) => {
  const coupon = await findCouponByIdRepo(couponId);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  return await updateCouponRepo(couponId, {
    isActive,
  });
};

// Delete Coupon

export const deleteCouponService = async (couponId) => {
  const coupon = await findCouponByIdRepo(couponId);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  await deleteCouponRepo(couponId);
};

// Validate Coupon

export const validateCouponService = async (code, orderAmount) => {
  const coupon = await findCouponByCodeRepo(code);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  if (!coupon.isActive) {
    throw new ApiError(400, 'Coupon is inactive.');
  }

  const now = new Date();

  if (coupon.startDate > now) {
    throw new ApiError(400, 'Coupon is not active yet.');
  }

  if (coupon.endDate < now) {
    throw new ApiError(400, 'Coupon has expired.');
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit exceeded.');
  }

  if (orderAmount < coupon.minimumOrderAmount) {
    throw new ApiError(400, `Minimum order amount is ${coupon.minimumOrderAmount}.`);
  }

  let discount = 0;

  if (coupon.type === 'percentage') {
    discount = (orderAmount * coupon.value) / 100;

    if (coupon.maximumDiscount !== null) {
      discount = Math.min(discount, coupon.maximumDiscount);
    }
  } else {
    discount = coupon.value;
  }

  discount = Math.min(discount, orderAmount);

  return {
    coupon,
    discount,
    finalAmount: orderAmount - discount,
  };
};
