import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    // =====================================
    // Relationships
    // =====================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // =====================================
    // Payment Gateway
    // =====================================

    gateway: {
      type: String,
      enum: ['cash_on_delivery', 'stripe', 'sslcommerz', 'bkash', 'nagad'],
      required: true,
      index: true,
    },

    // =====================================
    // Money
    // =====================================

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'BDT',
      uppercase: true,
      trim: true,
    },

    // =====================================
    // Status
    // =====================================

    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'cancelled', 'expired', 'refunded'],
      default: 'pending',
      index: true,
    },

    // =====================================
    // Transaction Info
    // =====================================

    transactionId: {
      type: String,
      default: null,
      index: true,
    },

    gatewayTransactionId: {
      type: String,
      default: null,
      index: true,
    },

    refundTransactionId: {
      type: String,
      default: null,
    },

    paymentIntentId: {
      type: String,
      default: null,
    },

    paymentReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true,
    },

    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },

    paymentFlow: {
      type: String,
      enum: ['redirect', 'embedded', 'cod', 'mobile_banking'],
      required: true,
    },

    // =====================================
    // Refund
    // =====================================

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundReason: {
      type: String,
      default: '',
      trim: true,
    },

    // =====================================
    // Error Handling
    // =====================================

    failureReason: {
      type: String,
      default: '',
      trim: true,
    },

    // =====================================
    // Gateway Response
    // =====================================

    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    webhookEvents: [
      {
        event: String,
        receivedAt: {
          type: Date,
          default: Date.now,
        },
        payload: mongoose.Schema.Types.Mixed,
      },
    ],

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // =====================================
    // Dates
    // =====================================

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    expiredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ======================================
   Indexes
====================================== */

// Find all payments for an order
paymentSchema.index({
  order: 1,
  createdAt: -1,
});

// Find payments by user
paymentSchema.index({
  user: 1,
  createdAt: -1,
});

// Gateway lookup
paymentSchema.index({
  gateway: 1,
  status: 1,
});

// Transaction lookup
paymentSchema.index({
  transactionId: 1,
});

// Gateway transaction lookup
paymentSchema.index({
  gatewayTransactionId: 1,
});

// Prevent duplicate payment intent (Stripe)
paymentSchema.index(
  {
    paymentIntentId: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);
