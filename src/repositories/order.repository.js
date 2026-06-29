import { Order } from '../models/order.model.js';

// Create

export const createOrderRepo = (data, options = {}) => {
  return Order.create([data], options).then(([order]) => order);
};

// Find One

export const findOrderByIdRepo = (orderId) => {
  return Order.findById(orderId).populate('user', 'username email').populate('coupon', 'code');
};

export const findOrderByIdLeanRepo = (orderId) => {
  return Order.findById(orderId)
    .populate('user', 'username email')
    .populate('coupon', 'code')
    .lean();
};

export const findOrderByNumberRepo = (orderNumber) => {
  return Order.findOne({
    orderNumber,
  });
};

export const findOrderByNumberLeanRepo = (orderNumber) => {
  return Order.findOne({
    orderNumber,
  }).lean();
};

// Find Many

export const findOrdersRepo = (filter = {}) => {
  return Order.find(filter).populate('user', 'username email').populate('coupon', 'code').sort({
    createdAt: -1,
  });
};

export const findOrdersLeanRepo = (filter = {}) => {
  return Order.find(filter)
    .populate('user', 'username email')
    .populate('coupon', 'code')
    .sort({
      createdAt: -1,
    })
    .lean();
};

export const findUserOrdersRepo = (userId) => {
  return Order.find({
    user: userId,
  })
    .populate('coupon', 'code')
    .sort({
      createdAt: -1,
    })
    .lean();
};

// Update

export const updateOrderRepo = (orderId, data) => {
  return Order.findByIdAndUpdate(orderId, data, {
    new: true,
    runValidators: true,
  })
    .populate('user', 'username email')
    .populate('coupon', 'code');
};

// Delete

export const deleteOrderRepo = (orderId) => {
  return Order.findByIdAndDelete(orderId);
};

// Utilities

export const countOrdersRepo = (filter = {}) => {
  return Order.countDocuments(filter);
};

// Find Order Document By ID

export const findOrderDocumentByIdRepo = (orderId, options = {}) => {
  return Order.findById(orderId).session(options.session);
};


export const saveOrderRepo = (
  order,
  options = {}
) => {
  return order.save(options);
};