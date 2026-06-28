import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Bangladesh',
    },

    division: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    district: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    area: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    addressLine: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    landmark: {
      type: String,
      trim: true,
      default: '',
      maxlength: 200,
    },

    label: {
      type: String,
      enum: ['Home', 'Office', 'Other'],
      default: 'Home',
    },

    isDefault: {
      type: Boolean,
      default: false,
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

// Fetch all addresses of a user quickly
addressSchema.index({
  user: 1,
});

// Fetch default address quickly
addressSchema.index({
  user: 1,
  isDefault: 1,
});

export const Address = mongoose.model('Address', addressSchema);
