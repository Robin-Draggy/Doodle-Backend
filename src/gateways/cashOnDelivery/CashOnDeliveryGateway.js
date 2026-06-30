import { PaymentGateway } from '../interfaces/PaymentGateway.js';

export class CashOnDeliveryGateway extends PaymentGateway {
  /**
   * Create COD payment
   */
  async createPayment({ payment, order, user }) {
    return {
      success: true,

      status: 'pending',

      paymentUrl: null,

      transactionId: null,

      gatewayTransactionId: null,

      paymentIntentId: null,

      expiresAt: null,

      metadata: {
        gateway: 'cash_on_delivery',
      },

      gatewayResponse: {
        message: 'Cash on Delivery selected. Payment will be collected upon delivery.',
      },
    };
  }

  /**
   * Verify COD payment
   *
   * Since COD has no payment provider,
   * verification simply reflects the
   * payment's current state in the database.
   */
  async verifyPayment({ payment, gatewayPayload }) {
    return {
      success: payment.status === 'paid',

      status: payment.status,

      transactionId: payment.transactionId,

      gatewayTransactionId: payment.gatewayTransactionId,

      paymentIntentId: null,

      failureReason: '',

      gatewayResponse: {
        message: 'Cash on Delivery payment verification completed.',
      },
    };
  }

  /**
   * Refund COD payment
   *
   * Refund happens outside the system.
   * We only record it.
   */
  async refundPayment({ payment, refundAmount, reason }) {
    return {
      success: true,

      refundAmount,

      refundedAt: new Date(),

      gatewayResponse: {
        gateway: 'cash_on_delivery',

        message: 'Cash on Delivery refund recorded successfully.',

        reason,
      },
    };
  }
}
