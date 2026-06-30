export class PaymentGateway {
  /**
   * Create a payment request.
   *
   * @param {Object} params
   * @param {Object} params.payment
   * @param {Object} params.order
   * @param {Object} params.user
   *
   * @returns {Promise<{
   *   success: boolean,
   *   status: string,
   *   paymentUrl: string|null,
   *   transactionId: string|null,
   *   gatewayTransactionId: string|null,
   *   paymentIntentId: string|null,
   *   expiresAt: Date|null,
   *   metadata: Object,
   *   gatewayResponse: Object
   * }>}
   */
  async createPayment({ payment, order, user }) {
    throw new Error(`${this.constructor.name} must implement createPayment().`);
  }

  /**
   * Verify a payment after callback/webhook.
   *
   * @param {Object} params
   * @param {Object} params.payment
   * @param {Object} params.gatewayPayload
   *
   * @returns {Promise<{
   *   success: boolean,
   *   status: string,
   *   transactionId: string|null,
   *   gatewayTransactionId: string|null,
   *   paymentIntentId: string|null,
   *   failureReason: string,
   *   gatewayResponse: Object
   * }>}
   */
  async verifyPayment({ payment, gatewayPayload }) {
    throw new Error(`${this.constructor.name} must implement verifyPayment().`);
  }

  /**
   * Refund a payment.
   *
   * @param {Object} params
   * @param {Object} params.payment
   * @param {number} params.refundAmount
   * @param {string} params.reason
   *
   * @returns {Promise<{
   *   success: boolean,
   *   refundAmount: number,
   *   refundedAt: Date,
   *   gatewayResponse: Object
   * }>}
   */
  async refundPayment({ payment, refundAmount, reason }) {
    throw new Error(`${this.constructor.name} must implement refundPayment().`);
  }
}
