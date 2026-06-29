export const stripeGateway = {
  async createPayment() {
    throw new Error(
      "Stripe gateway not implemented yet."
    );
  },

  async verifyPayment() {
    throw new Error(
      "Stripe gateway not implemented yet."
    );
  },

  async refundPayment() {
    throw new Error(
      "Stripe gateway not implemented yet."
    );
  },

  async handleWebhook() {
    throw new Error(
      "Stripe gateway not implemented yet."
    );
  },
};