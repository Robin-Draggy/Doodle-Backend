import { cashOnDeliveryGateway } from "./cashOnDelivery.gateway.js";
import { stripeGateway } from "./stripe.gateway.js";
import { sslCommerzGateway } from "./sslcommerz.gateway.js";
import { bkashGateway } from "./bkash.gateway.js";
import { nagadGateway } from "./nagad.gateway.js";
import { ApiError } from "../utils/ApiError.js";

const gateways = {
  cash_on_delivery: cashOnDeliveryGateway,
  stripe: stripeGateway,
  sslcommerz: sslCommerzGateway,
  bkash: bkashGateway,
  nagad: nagadGateway,
};

export const getPaymentGateway = (gatewayName) => {
  const gateway = gateways[gatewayName];

  if (!gateway) {
    throw new ApiError(
      400,
      `Unsupported payment gateway: ${gatewayName}`
    );
  }

  return gateway;
};