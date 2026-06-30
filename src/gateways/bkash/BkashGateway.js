import { createPayment, executePayment, queryPayment, refundTransaction } from 'bkash-payment';

import { PaymentGateway } from '../interfaces/PaymentGateway.js';
import { bkashConfig } from './bkash.config.js';
import { ApiError } from '../../utils/ApiError.js';

export class BkashGateway extends PaymentGateway {
  /* ======================================================
      Create Payment
  ======================================================= */

  async createPayment({ payment, order, user }) {
    try {
      const paymentDetails = {
        amount: payment.amount,

        callbackURL: bkashConfig.callbackUrl,

        orderID: order.orderNumber,

        reference: user._id.toString(),
      };

      const response = await createPayment(bkashConfig, paymentDetails);

      if (response.statusCode && response.statusCode !== '0000') {
        throw new ApiError(400, response.statusMessage);
      }

      return {
        success: true,

        status: 'pending',

        paymentUrl: response.bkashURL,

        transactionId: null,

        gatewayTransactionId: response.paymentID,

        paymentIntentId: null,

        expiresAt: null,

        metadata: {},

        gatewayResponse: response,
      };
    } catch (error) {
      throw this.#normalizeError(error);
    }
  }

  /* ======================================================
      Verify Payment
  ======================================================= */

  async verifyPayment({ payment, gatewayPayload }) {
    try {
      const paymentID = gatewayPayload.paymentID ?? payment.gatewayTransactionId;

      if (!paymentID) {
        throw new ApiError(400, 'Missing payment ID.');
      }

      let response;

      try {
        response = await executePayment(bkashConfig, paymentID);
      } catch (error) {
        /**
         * Official Flow
         *
         * Execute
         * ↓
         * Timeout
         * ↓
         * Query
         */

        response = await queryPayment(bkashConfig, paymentID);
      }

      const status = this.#mapStatus(response.transactionStatus);

      return {
        success: status === 'paid',

        status,

        transactionId: response.trxID ?? null,

        gatewayTransactionId: response.paymentID ?? null,

        paymentIntentId: null,

        failureReason: response.statusMessage ?? '',

        gatewayResponse: response,
      };
    } catch (error) {
      throw this.#normalizeError(error);
    }
  }

  /* ======================================================
      Refund Payment
  ======================================================= */

  async refundPayment({ payment, refundAmount, reason }) {
    try {
      if (!payment.gatewayTransactionId || !payment.transactionId) {
        throw new ApiError(400, 'Payment cannot be refunded.');
      }

      const refundDetails = {
        paymentID: payment.gatewayTransactionId,

        trxID: payment.transactionId,

        amount: refundAmount,
      };

      const response = await refundTransaction(bkashConfig, refundDetails);

      if (response.statusCode && response.statusCode !== '0000') {
        throw new ApiError(400, response.statusMessage);
      }

      return {
        success: true,

        refundAmount,

        refundedAt: new Date(),

        gatewayResponse: response,

        metadata: {
          reason,
        },
      };
    } catch (error) {
      throw this.#normalizeError(error);
    }
  }

  /* ======================================================
      Status Mapper
  ======================================================= */

  #mapStatus(status) {
    const statuses = {
      Completed: 'paid',

      Pending: 'pending',

      Initiated: 'pending',

      Processing: 'processing',

      Failed: 'failed',

      Cancelled: 'cancelled',

      Expired: 'expired',
    };

    return statuses[status] ?? 'failed';
  }

  /* ======================================================
      Normalize Error
  ======================================================= */

  #normalizeError(error) {
    if (error instanceof ApiError) {
      return error;
    }

    if (error?.statusMessage) {
      return new ApiError(400, error.statusMessage);
    }

    if (error?.message) {
      return new ApiError(400, error.message);
    }

    return new ApiError(500, 'bKash gateway error.');
  }
}
