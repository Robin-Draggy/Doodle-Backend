import { Payment } from '../models/payment.model.js';

// Create

export const createPaymentRepo = async (paymentData, options = {}) => {
  const [payment] = await Payment.create([paymentData], options);

  return payment;
};

// Save

export const savePaymentRepo = (payment, options = {}) => {
  return payment.save(options);
};

// Find By ID

export const findPaymentByIdRepo = (
  paymentId
) => {
  return Payment.findById(paymentId)
    .populate(
      "order",
      "orderNumber totalAmount orderStatus paymentStatus"
    )
    .populate(
      "user",
      "username email"
    );
};

// Find By Reference

export const findPaymentByReferenceRepo = (paymentReference) => {
  return Payment.findOne({
    paymentReference,
  });
};

// Transaction Lookup

export const findPaymentByTransactionIdRepo = (transactionId) => {
  return Payment.findOne({
    transactionId,
  });
};

export const findPaymentByGatewayTransactionIdRepo = (gatewayTransactionId) => {
  return Payment.findOne({
    gatewayTransactionId,
  });
};

export const findPaymentByPaymentIntentRepo = (paymentIntentId) => {
  return Payment.findOne({
    paymentIntentId,
  });
};

// Order Payments

export const findPaymentsByOrderRepo = (
  orderId
) => {
  return Payment.find({
    order: orderId,
  })
    .populate(
      "user",
      "username email"
    )
    .sort({
      attemptNumber: -1,
    });
};

export const findLatestPaymentByOrderRepo = (orderId) => {
  return Payment.findOne({
    order: orderId,
  }).sort({
    createdAt: -1,
  });
};

// User Payments

export const findPaymentsByUserRepo = (userId, filter = {}) => {
  return Payment.find({
    user: userId,
    ...filter,
  })
    .populate('order', 'orderNumber totalAmount orderStatus paymentStatus')
    .sort({
      createdAt: -1,
    });
};

// Admin Payments

export const findPaymentsRepo = ({ filter = {}, page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  return Payment.find(filter)
    .populate('user', 'username email')
    .populate('order', 'orderNumber totalAmount orderStatus paymentStatus')
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);
};

export const countPaymentsRepo = (filter = {}) => {
  return Payment.countDocuments(filter);
};

// Update

export const updatePaymentRepo = (paymentId, update, options = {}) => {
  return Payment.findByIdAndUpdate(paymentId, update, {
    new: true,
    runValidators: true,
    ...options,
  });
};

// Delete

export const deletePaymentRepo = (paymentId) => {
  return Payment.findByIdAndDelete(paymentId);
};


