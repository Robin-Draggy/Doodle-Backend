import { ApiResponse } from '../utils/ApiResponse.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

import {
  createPaymentService,
  verifyPaymentService,
  getMyPaymentsService,
  getPaymentByIdService,
  getPaymentsByOrderService,
  getAllPaymentsService,
} from "../services/payment.service.js";

// Create

export const createPayment = AsyncHandler(async (req, res) => {
  const payment = await createPaymentService({
    userId: req.user._id,
    ...req.body,
  });

  return res.status(201).json(new ApiResponse(201, payment, 'Payment initiated successfully.'));
});

// Verify

export const verifyPayment = AsyncHandler(async (req, res) => {
  const payment = await verifyPaymentService({
    paymentReference: req.body.paymentReference,
    gatewayPayload: req.body,
  });

  return res.status(200).json(new ApiResponse(200, payment, 'Payment verified successfully.'));
});


export const getMyPayments = AsyncHandler(
  async (req, res) => {
    const payments =
      await getMyPaymentsService(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        payments,
        "Payments fetched successfully."
      )
    );
  }
);


export const getPaymentById = AsyncHandler(
  async (req, res) => {
    const payment =
      await getPaymentByIdService({
        paymentId:
          req.params.paymentId,
        user: req.user,
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        payment,
        "Payment fetched successfully."
      )
    );
  }
);


export const getPaymentsByOrder =
  AsyncHandler(
    async (req, res) => {
      const payments =
        await getPaymentsByOrderService(
          {
            orderId:
              req.params.orderId,
            user: req.user,
          }
        );

      return res.status(200).json(
        new ApiResponse(
          200,
          payments,
          "Payments fetched successfully."
        )
      );
    }
  );


  export const getAllPayments =
  AsyncHandler(
    async (req, res) => {
      const payments =
        await getAllPaymentsService();

      return res.status(200).json(
        new ApiResponse(
          200,
          payments,
          "Payments fetched successfully."
        )
      );
    }
  );


  