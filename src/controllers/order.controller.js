import {
  createOrderService,
  getMyOrdersService,
  getOrderByIdService,
  getAllOrdersService,
  updateOrderStatusService,
  updatePaymentStatusService,
  cancelOrderService,
} from "../services/order.service.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

// Create Order

export const createOrder = AsyncHandler(
  async (req, res) => {
    console.log("Validated Data:", req.validatedData); // Debugging line
    const order = await createOrderService({
      userId: req.user._id,
      ...req.body,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          order,
          "Order created successfully."
        )
      );
  }
);

// Get My Orders

export const getMyOrders = AsyncHandler(
  async (req, res) => {
    const orders =
      await getMyOrdersService(
        req.user._id
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          orders,
          "Orders fetched successfully."
        )
      );
  }
);

// Get Order By ID

export const getOrderById = AsyncHandler(
  async (req, res) => {
    const order =
      await getOrderByIdService(
        req.params.orderId,
        req.user
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          order,
          "Order fetched successfully."
        )
      );
  }
);

// Get All Orders

export const getAllOrders = AsyncHandler(
  async (req, res) => {
    const orders =
      await getAllOrdersService();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          orders,
          "Orders fetched successfully."
        )
      );
  }
);

// Update Order Status

export const updateOrderStatus =
  AsyncHandler(async (req, res) => {
    const order =
      await updateOrderStatusService(
        req.params.orderId,
        req.validatedData.orderStatus
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          order,
          "Order status updated successfully."
        )
      );
  });

// Update Payment Status

export const updatePaymentStatus =
  AsyncHandler(async (req, res) => {
    const order =
      await updatePaymentStatusService(
        req.params.orderId,
        req.validatedData.paymentStatus
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          order,
          "Payment status updated successfully."
        )
      );
  });

// Cancel Order

export const cancelOrder =
  AsyncHandler(async (req, res) => {
    const order =
      await cancelOrderService(
        req.params.orderId,
        req.user
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          order,
          "Order cancelled successfully."
        )
      );
  });