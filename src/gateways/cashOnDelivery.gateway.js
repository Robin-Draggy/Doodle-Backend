export const cashOnDeliveryGateway = {
  async createPayment(payment) {
    return {
      status: "pending",

      paymentReference:
        payment.paymentReference,

      redirectUrl: null,

      gatewayResponse: {},
    };
  },

  async verifyPayment() {
    return {
      status: "pending",
    };
  },

  async refundPayment() {
    throw new Error(
      "Cash on Delivery payments cannot be refunded automatically."
    );
  },

  async handleWebhook() {
    return null;
  },
};