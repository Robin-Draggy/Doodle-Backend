import { Cart } from '../models/cart.model.js';

// Create a new cart for a user

export const createCartRepo = (data) => {
  return Cart.create(data);
};

// Find cart by user ID

export const findCartByUserRepo = (userId) => {
  return Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'title slug brand images price discountPrice stock status',
  });
};

export const findCartByUserLeanRepo = (userId) => {
  return Cart.findOne({ user: userId })
    .populate({
      path: 'items.product',
      select: 'title slug brand images price discountPrice stock status',
    })
    .lean();
};

export const findCartDocumentByUserRepo = (userId) => {
  return Cart.findOne({ user: userId });
};

// Update cart by user ID

export const saveCartRepo = (cart) => {
  return cart.save();
};

// Delete cart by user ID

export const deleteCartRepo = (userId) => {
  return Cart.findOneAndDelete({
    user: userId,
  });
};
