import { ApiError } from "../utils/ApiError.js";

import { CashOnDeliveryGateway } from "./cashOnDelivery/CashOnDeliveryGateway.js";
import { BkashGateway } from "./bkash/BkashGateway.js";
// import { NagadGateway } from "./nagad/NagadGateway.js";
// import { StripeGateway } from "./stripe/StripeGateway.js";
// import { SSLCommerzGateway } from "./sslcommerz/SSLCommerzGateway.js";

export class PaymentGatewayFactory {
  /**
   * Registry of supported gateways.
   *
   * Each value is a singleton instance.
   */
  static gateways = {
    cash_on_delivery: new CashOnDeliveryGateway(),

    bkash: new BkashGateway(),

    // nagad: new NagadGateway(),

    // stripe: new StripeGateway(),

    // sslcommerz: new SSLCommerzGateway(),
  };

  /**
   * Returns a gateway instance.
   *
   * @param {string} gateway
   * @returns {PaymentGateway}
   */
  static make(gateway) {
    const paymentGateway = this.gateways[gateway];

    if (!paymentGateway) {
      throw new ApiError(
        400,
        `Unsupported payment gateway: ${gateway}`
      );
    }

    return paymentGateway;
  }

  /**
   * Check whether a gateway is supported.
   */
  static supports(gateway) {
    return Object.hasOwn(this.gateways, gateway);
  }

  /**
   * Returns all registered gateways.
   *
   * Useful for admin dashboards
   * and configuration endpoints.
   */
  static availableGateways() {
    return Object.keys(this.gateways);
  }
}