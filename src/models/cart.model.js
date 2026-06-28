import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // Snapshot of product price when it was added
    priceAtAddition: {
      type: Number,
      required: true,
      min: 0,
    },

    // Snapshot of discount price (if any)
    discountPriceAtAddition: {
      type: Number,
      default: null,
      min: 0,
    },

    // Final unit price used for calculations
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

/* ===========================
   Indexes
=========================== */

// One cart per user
cartSchema.index(
  { user: 1 },
  { unique: true }
);

// Fast lookup for product inside a user's cart
cartSchema.index({
  user: 1,
  "items.product": 1,
});

export const Cart = mongoose.model("Cart", cartSchema);