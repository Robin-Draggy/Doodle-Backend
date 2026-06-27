import mongoose from "mongoose";
import slugify from "slugify";
import crypto from "crypto";

const specificationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

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
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    sku: {
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
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    specifications: [specificationSchema],

    images: [imageSchema],

    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

/* ===========================
   Indexes
=========================== */

productSchema.index({
  title: "text",
  description: "text",
  brand: "text",
});

productSchema.index({
  category: 1,
  status: 1,
});

productSchema.index({
  isFeatured: 1,
  status: 1,
});

productSchema.index({
  price: 1,
});

productSchema.index({
  brand: 1,
});

productSchema.index({
  soldCount: -1,
});

productSchema.index({
  createdAt: -1,
});

productSchema.set("toJSON", {
  versionKey: false,
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

productSchema.set("toObject", {
  versionKey: false,
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

/* ===========================
   Middleware
=========================== */

productSchema.pre("validate", function () {
  // Generate slug only when title changes
  if (this.isModified("title")) {
    const baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    this.slug = `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`;
  }

  // Generate SKU once
  if (!this.sku) {
    this.sku = `PRD-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }

  // Validate discount
  if (
    this.discountPrice != null &&
    this.discountPrice >= this.price
  ) {
    throw new Error(
      "Discount price must be less than original price."
    );
  }

  // Remove duplicate tags
  if (this.tags?.length) {
    this.tags = [
      ...new Set(
        this.tags.map((tag) => tag.trim().toLowerCase())
      ),
    ];
  }
});

export const Product = mongoose.model("Product", productSchema);