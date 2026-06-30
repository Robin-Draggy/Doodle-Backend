import mongoose from 'mongoose';

import { ApiError } from '../utils/ApiError.js';

import {
  createPaymentRepo,
  savePaymentRepo,
  findLatestPaymentByOrderRepo,
  findPaymentByReferenceRepo,
  findPaymentByIdRepo,
  findPaymentsByUserRepo,
  findPaymentsByOrderRepo,
  findPaymentsRepo,
} from '../repositories/payment.repository.js';

import { findOrderDocumentByIdRepo } from '../repositories/order.repository.js';

import { getPaymentGateway } from '../gateways/payment.gateway.js';

import { generatePaymentReference } from '../config/helper.js';

import { PAYMENT_GATEWAYS, PAYMENT_CURRENCY, PAYMENT_STATUS_FLOW } from '../config/constants.js';

// Create Payment

export const createPaymentService = async ({ orderId, userId, gateway }) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const order = await findOrderDocumentByIdRepo(orderId);

    if (!order) {
      throw new ApiError(404, 'Order not found.');
    }

    // Ownership check

    if (order.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to pay for this order.');
    }

    // checking if already paid or not

    if (order.paymentStatus === 'paid') {
      throw new ApiError(400, 'This order has already been paid.');
    }

    // validating gateway

    if (!PAYMENT_GATEWAYS.includes(gateway)) {
      throw new ApiError(400, 'Unsupported payment gateway.');
    }

    // Prevent Duplicate

    const latestPayment = await findLatestPaymentByOrderRepo(order._id);

    if (latestPayment && ['pending', 'processing'].includes(latestPayment.status)) {
      throw new ApiError(400, 'A payment attempt is already in progress.');
    }

    const payment = await createPaymentRepo(
      {
        order: order._id,

        user: userId,

        gateway,

        amount: order.totalAmount,

        currency: PAYMENT_CURRENCY,

        paymentReference: generatePaymentReference(),

        attemptNumber: latestPayment ? latestPayment.attemptNumber + 1 : 1,

        status: 'pending',
      },
      {
        session,
      }
    );

    const paymentGateway = getPaymentGateway(gateway);

    const gatewayResponse = await paymentGateway.createPayment(payment, order);

    payment.status = gatewayResponse.status ?? payment.status;

    payment.gatewayResponse = gatewayResponse.gatewayResponse ?? {};

    if (gatewayResponse.transactionId) {
      payment.transactionId = gatewayResponse.transactionId;
    }

    if (gatewayResponse.gatewayTransactionId) {
      payment.gatewayTransactionId = gatewayResponse.gatewayTransactionId;
    }

    if (gatewayResponse.paymentIntentId) {
      payment.paymentIntentId = gatewayResponse.paymentIntentId;
    }

    if (gatewayResponse.metadata) {
      payment.metadata = gatewayResponse.metadata;
    }

    await savePaymentRepo(payment, {
      session,
    });

    await session.commitTransaction();

    return {
      payment,

      redirectUrl: gatewayResponse.redirectUrl ?? null,
    };
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

// Verify Payment

export const verifyPaymentService = async ({ paymentReference, gatewayPayload }) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    /* =====================================
       Find Payment
    ===================================== */

    const payment = await findPaymentByReferenceRepo(paymentReference);

    if (!payment) {
      throw new ApiError(404, 'Payment not found.');
    }

    /* =====================================
       Already Paid?
    ===================================== */

    if (payment.status === 'paid') {
      await session.commitTransaction();

      return payment;
    }

    /* =====================================
       Load Order
    ===================================== */

    const order = await findOrderDocumentByIdRepo(payment.order);

    if (!order) {
      throw new ApiError(404, 'Order not found.');
    }

    /* =====================================
       Gateway Verification
    ===================================== */

    const paymentGateway = getPaymentGateway(payment.gateway);

    const verification = await paymentGateway.verifyPayment(payment, gatewayPayload);

    /* =====================================
       Update Payment
    ===================================== */

    payment.status = verification.status;

    payment.gatewayResponse = {
      ...payment.gatewayResponse,
      ...verification.gatewayResponse,
    };

    if (verification.transactionId) {
      payment.transactionId = verification.transactionId;
    }

    if (verification.gatewayTransactionId) {
      payment.gatewayTransactionId = verification.gatewayTransactionId;
    }

    if (verification.paymentIntentId) {
      payment.paymentIntentId = verification.paymentIntentId;
    }

    if (verification.metadata) {
      payment.metadata = verification.metadata;
    }

    /* =====================================
       Update Order
    ===================================== */

    if (verification.status === 'paid') {
      order.paymentStatus = 'paid';

      payment.paidAt = new Date();
    }

    if (verification.status === 'failed') {
      order.paymentStatus = 'failed';
    }

    await savePaymentRepo(payment, {
      session,
    });

    await saveOrderRepo(order, {
      session,
    });

    await session.commitTransaction();

    return payment;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

// Get user payments

export const getMyPaymentsService = async (userId) => {
  return await findPaymentsByUserRepo(userId);
};

export const getPaymentByIdService = async ({ paymentId, user }) => {
  const payment = await findPaymentByIdRepo(paymentId);

  if (!payment) {
    throw new ApiError(404, 'Payment not found.');
  }

  const isOwner = payment.user.toString() === user._id.toString();

  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to view this payment.');
  }

  return await findPaymentByIdRepo(paymentId);
};

export const getPaymentsByOrderService = async ({ orderId, user }) => {
  const payments = await findPaymentsByOrderRepo(orderId);

  if (payments.length === 0) {
    return [];
  }

  const isOwner = payments[0].user._id.toString() === user._id.toString();

  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to view these payments.');
  }

  return payments;
};

export const getAllPaymentsService = async () => {
  return await findPaymentsRepo();
};
