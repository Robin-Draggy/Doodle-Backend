import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const reviewSchema = new mongoose.Schema(
  {
    // Product being reviewed
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // User who wrote the review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional title
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    // Review content
    comment: {
      type: String,
      trim: true,
      required: true,
      maxlength: 2000,
    },

    // Rating (1-5)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review images
    images: [imageSchema],

    // Will be connected with Orders later
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },

    // Useful for frontend
    isEdited: {
      type: Boolean,
      default: false,
    },

    // Admin moderation
    status: {
      type: String,
      enum: ["published", "hidden"],
      default: "published",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

/* =====================================
   INDEXES
===================================== */

// Only one review per product per user
reviewSchema.index(
  {
    product: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

// Product reviews
reviewSchema.index({
  product: 1,
  status: 1,
  createdAt: -1,
});

// User reviews
reviewSchema.index({
  user: 1,
  createdAt: -1,
});

// Rating filter
reviewSchema.index({
  rating: 1,
});

// Verified purchase filter
reviewSchema.index({
  verifiedPurchase: 1,
});

// Status filter
reviewSchema.index({
  status: 1,
});

/* =====================================
   MIDDLEWARE
===================================== */

reviewSchema.pre("save", function () {
  if (!this.isNew) {
    this.isEdited = true;
  }
});

export const Review = mongoose.model("Review", reviewSchema);