import mongoose from 'mongoose';

import {
  createOrderRepo,
  findOrderByIdRepo,
  findOrderDocumentByIdRepo,
  findOrdersRepo,
  findUserOrdersRepo,
} from '../repositories/order.repository.js';
import { findCartDocumentByUserRepo, saveCartRepo } from '../repositories/cart.repository.js';
import {
  reserveProductStockRepo,
  restoreProductStockRepo,
} from '../repositories/product.repository.js';
import {
  decrementCouponUsageRepo,
  findCouponByCodeRepo,
  incrementCouponUsageRepo,
} from '../repositories/coupon.repository.js';

import { findUserAddressByIdRepo } from '../repositories/address.repository.js';
import { generateOrderNumber, buildOrderItems, buildShippingAddress } from '../config/helper.js';

import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUS_FLOW, PAYMENT_STATUS_FLOW } from '../config/constants.js';

// Create Order Service

export const createOrderService = async ({
  userId,
  addressId,
  couponCode,
  paymentMethod,
  notes,
}) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    // Loading Cart
    const cart = await findCartDocumentByUserRepo(userId);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty.');
    }

    // Populate Product
    await cart.populate('items.product');

    // Verifying Product Availability
    for (const item of cart.items) {
      if (!item.product) {
        throw new ApiError(404, 'One or more products no longer exist.');
      }

      if (item.product.status !== 'published') {
        throw new ApiError(400, `${item.product.name} is unavailable.`);
      }
    }

    // Verifying Stock Availability
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new ApiError(
          400,
          `${item.product.name} has only ${item.product.stock} left in stock.`
        );
      }
    }

    // Loading Shipping Address
    const address = await findUserAddressByIdRepo(userId, addressId);

    if (!address) {
      throw new ApiError(404, 'Address not found.');
    }

    // Calculate Order Totals
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      const finalPrice = product.discountPrice ?? product.price;

      subtotal += finalPrice * item.quantity;
    }

    let discount = 0;
    let coupon = null;

    const shippingFee = 0;
    const tax = 0;

    // Validate Coupon (If Provided)

    if (couponCode) {
      coupon = await findCouponByCodeRepo(couponCode);

      if (!coupon) {
        throw new ApiError(404, 'Coupon not found.');
      }

      if (!coupon.isActive) {
        throw new ApiError(400, 'Coupon is inactive.');
      }

      const now = new Date();

      if (coupon.startDate > now) {
        throw new ApiError(400, 'Coupon is not active yet.');
      }

      if (coupon.endDate < now) {
        throw new ApiError(400, 'Coupon has expired.');
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new ApiError(400, 'Coupon usage limit exceeded.');
      }

      if (subtotal < coupon.minimumOrderAmount) {
        throw new ApiError(400, `Minimum order amount is ${coupon.minimumOrderAmount}.`);
      }

      //   Calculate Discount Based on Coupon Type

      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.value) / 100;

        if (coupon.maximumDiscount != null) {
          discount = Math.min(discount, coupon.maximumDiscount);
        }
      } else {
        discount = coupon.value;
      }

      discount = Math.min(discount, subtotal);
    }

    // Calculate Final Total Amount

    const totalAmount = subtotal + shippingFee + tax - discount;

    //   Building Order Snapshot

    const orderItems = buildOrderItems(cart);

    const shippingAddress = buildShippingAddress(address);

    const orderNumber = generateOrderNumber();

    //   Create Order Document

    const order = await createOrderRepo(
      {
        orderNumber,

        user: userId,

        items: orderItems,

        shippingAddress,

        coupon: coupon?._id ?? null,

        couponCode: coupon?.code ?? null,

        discount,

        subtotal,

        shippingFee,

        tax,

        totalAmount,

        paymentMethod,

        notes,
      },
      {
        session,
      }
    );

    //   Reduce Product Stock

    for (const item of cart.items) {
      const updatedProduct = await reserveProductStockRepo(item.product._id, item.quantity, {
        session,
      });

      if (!updatedProduct) {
        throw new ApiError(
          400,
          `${item.product.name} is out of stock or no longer has enough inventory.`
        );
      }
    }

    // Increment Coupon Usage Count (If Applied)
    if (coupon) {
      await incrementCouponUsageRepo(coupon._id, { session });
    }
    // Clear User's Cart

    cart.items = [];

    cart.totalItems = 0;
    cart.subtotal = 0;
    cart.totalDiscount = 0;
    cart.grandTotal = 0;

    await saveCartRepo(cart, {
      session,
    });

    await session.commitTransaction();

    const populatedOrder = await findOrderByIdRepo(order._id);

    return populatedOrder;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

// Get My Orders Service

export const getMyOrdersService = async (userId) => {
  return await findUserOrdersRepo(userId);
};

// Get Order By ID Service

export const getOrderByIdService = async (orderId, user) => {
  const order = await findOrderByIdRepo(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const isOwner = order.user._id.toString() === user._id.toString();

  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to view this order.');
  }

  return order;
};

// Get All Orders Service

export const getAllOrdersService = async () => {
  return await findOrdersRepo();
};

// Update Order Status Service

export const updateOrderStatusService = async (orderId, orderStatus) => {
  const order = await findOrderByIdRepo(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const allowedStatuses = ORDER_STATUS_FLOW[order.orderStatus];

  if (!allowedStatuses.includes(orderStatus)) {
    throw new ApiError(
      400,
      `Cannot change order status from "${order.orderStatus}" to "${orderStatus}".`
    );
  }

  order.orderStatus = orderStatus;

  await order.save();

  return await findOrderByIdRepo(order._id);
};

// Update Payment Status Service

export const updatePaymentStatusService = async (orderId, paymentStatus) => {
  const order = await findOrderByIdRepo(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const allowedStatuses = PAYMENT_STATUS_FLOW[order.paymentStatus];

  if (!allowedStatuses.includes(paymentStatus)) {
    throw new ApiError(
      400,
      `Cannot change payment status from "${order.paymentStatus}" to "${paymentStatus}".`
    );
  }

  order.paymentStatus = paymentStatus;

  await order.save();

  return await findOrderByIdRepo(order._id);
};

// Cancel Order Service

export const cancelOrderService = async (orderId, user) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const order = await findOrderDocumentByIdRepo(orderId, { session });

    if (!order) {
      throw new ApiError(404, 'Order not found.');
    }

    const isOwner = order.user.toString() === user._id.toString();

    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'You are not authorized to cancel this order.');
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      throw new ApiError(400, `Order cannot be cancelled once it is ${order.orderStatus}.`);
    }

    for (const item of order.items) {
      await restoreProductStockRepo(item.product, item.quantity, { session });
    }

    if (order.coupon) {
      await decrementCouponUsageRepo(order.coupon, { session });
    }

    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    order.orderStatus = 'cancelled';

    order.cancelledAt = new Date();

    await order.save({
      session,
    });

    await session.commitTransaction();

    session.endSession();

    return await findOrderByIdRepo(order._id);
  } catch (error) {
    await session.abortTransaction();

    throw error;
  }
};
