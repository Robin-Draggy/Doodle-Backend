import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
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

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    products: {
      type: [wishlistItemSchema],
      default: [],
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

// One wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

// Faster lookup when checking whether a product
// exists inside a user's wishlist
wishlistSchema.index({
  user: 1,
  'products.product': 1,
});

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
