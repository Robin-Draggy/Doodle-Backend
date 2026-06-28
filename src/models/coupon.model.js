import mongoose from "mongoose";
import crypto from "crypto";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },

    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: 1,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumDiscount: {
      type: Number,
      default: null,
      min: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ===========================
   Indexes
=========================== */

couponSchema.index({
  code: 1,
});

couponSchema.index({
  isActive: 1,
});

couponSchema.index({
  startDate: 1,
  endDate: 1,
});

/* ===========================
   Middleware
=========================== */

couponSchema.pre("validate", function () {
  // Generate coupon code if not provided
  if (!this.code) {
    this.code = `SAVE-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;
  }

  // Percentage coupons cannot exceed 100%
  if (
    this.type === "percentage" &&
    this.value > 100
  ) {
    throw new Error(
      "Percentage discount cannot exceed 100."
    );
  }

  // End date must be after start date
  if (this.endDate <= this.startDate) {
    throw new Error(
      "End date must be after start date."
    );
  }

  // Fixed coupons don't need a maximum discount
  if (this.type === "fixed") {
    this.maximumDiscount = null;
  }
});

export const Coupon = mongoose.model(
  "Coupon",
  couponSchema
);