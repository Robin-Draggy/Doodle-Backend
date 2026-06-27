import mongoose from "mongoose";
import slugify from "slugify";

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

const seoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
      maxlength: 60,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 160,
    },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    image: imageSchema,

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    seo: {
      type: seoSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

/* ===========================
   Indexes
=========================== */

categorySchema.index({ slug: 1 }, { unique: true });

categorySchema.index({
  parent: 1,
  status: 1,
});

categorySchema.index({
  isFeatured: 1,
  status: 1,
});

categorySchema.index({
  sortOrder: 1,
});

categorySchema.index({
  name: "text",
  description: "text",
});

/* ===========================
   Middleware
=========================== */

categorySchema.pre("validate", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  // Generate SEO defaults if not provided
  if (!this.seo.title) {
    this.seo.title = this.name;
  }

  if (!this.seo.description && this.description) {
    this.seo.description = this.description.substring(0, 160);
  }
});

/* ===========================
   Transform Response
=========================== */

categorySchema.set("toJSON", {
  versionKey: false,
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

categorySchema.set("toObject", {
  versionKey: false,
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Category = mongoose.model("Category", categorySchema);