import { Coupon } from '../models/coupon.model.js';

// Create

export const createCouponRepo = (data) => {
  return Coupon.create(data);
};

// Find One

export const findCouponByIdRepo = (couponId) => {
  return Coupon.findById(couponId);
};

export const findCouponByIdLeanRepo = (couponId) => {
  return Coupon.findById(couponId).lean();
};

export const findCouponByCodeRepo = (code) => {
  return Coupon.findOne({
    code: code.trim().toUpperCase(),
  });
};

export const findCouponByCodeLeanRepo = (code) => {
  return Coupon.findOne({
    code: code.trim().toUpperCase(),
  }).lean();
};

// Find Many

export const findCouponsRepo = (filter = {}) => {
  return Coupon.find(filter).sort({
    createdAt: -1,
  });
};

export const findCouponsLeanRepo = (filter = {}) => {
  return Coupon.find(filter)
    .sort({
      createdAt: -1,
    })
    .lean();
};

export const findActiveCouponsRepo = () => {
  return Coupon.find({
    isActive: true,
  })
    .sort({
      createdAt: -1,
    })
    .lean();
};

// Update

export const updateCouponRepo = (couponId, data) => {
  return Coupon.findByIdAndUpdate(couponId, data, {
    new: true,
    runValidators: true,
  });
};

// Delete

export const deleteCouponRepo = (couponId) => {
  return Coupon.findByIdAndDelete(couponId);
};

// Utilities

export const saveCouponRepo = (coupon, options = {}) => {
  return coupon.save(options);
};

// Increment Coupon Usage Count (If Applied)

export const incrementCouponUsageRepo = (couponId, options = {}) => {
  return Coupon.findByIdAndUpdate(
    couponId,
    {
      $inc: {
        usedCount: 1,
      },
    },
    {
      new: true,
      session: options.session,
    }
  );
};

// Decrement Coupon Usage Count (If Applied)

export const decrementCouponUsageRepo = (couponId, options = {}) => {
  return Coupon.findByIdAndUpdate(
    couponId,
    {
      $inc: {
        usedCount: -1,
      },
    },
    {
      new: true,
      session: options.session,
    }
  );
};
