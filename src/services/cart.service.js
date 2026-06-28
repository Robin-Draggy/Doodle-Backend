import { calculateCartTotals, getOrCreateCart } from '../config/helper.js';
import { findCartByUserRepo, saveCartRepo } from '../repositories/cart.repository.js';

import { findProductByIdLeanRepo } from '../repositories/product.repository.js';
import { ApiError } from '../utils/ApiError.js';

// Get Cart

export const getCartService = async (userId) => {
  const cart = await getOrCreateCart(userId);

  return await findCartByUserRepo(cart.user);
};

// Add to Cart

export const addToCartService = async (userId, productId, quantity = 1) => {
  const product = await findProductByIdLeanRepo(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  if (product.status !== 'published') {
    throw new ApiError(400, 'Product is not available.');
  }

  if (product.stock < quantity) {
    throw new ApiError(400, 'Insufficient stock available.');
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find((item) => item.product.toString() === productId.toString());

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.stock) {
      throw new ApiError(400, 'Requested quantity exceeds available stock.');
    }

    existingItem.quantity = newQuantity;
  } else {
    const finalPrice = product.discountPrice ?? product.price;

    cart.items.push({
      product: product._id,
      quantity,
      priceAtAddition: product.price,
      discountPriceAtAddition: product.discountPrice,
      finalPrice,
      subtotal: finalPrice * quantity,
    });
  }

  calculateCartTotals(cart);

  await saveCartRepo(cart);

  return await findCartByUserRepo(userId);
};

// Update Cart Item

export const updateCartItemService = async (userId, productId, quantity) => {
  const product = await findProductByIdLeanRepo(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  if (quantity > product.stock) {
    throw new ApiError(400, 'Requested quantity exceeds available stock.');
  }

  const cart = await getOrCreateCart(userId);

  const item = cart.items.find((item) => item.product.toString() === productId.toString());

  if (!item) {
    throw new ApiError(404, 'Product not found in cart.');
  }

  item.quantity = quantity;

  calculateCartTotals(cart);

  await saveCartRepo(cart);

  return await findCartByUserRepo(userId);
};

// Remove Item from Cart

export const removeFromCartService = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);

  const initialLength = cart.items.length;

  cart.items = cart.items.filter((item) => item.product.toString() !== productId.toString());

  if (cart.items.length === initialLength) {
    throw new ApiError(404, 'Product not found in cart.');
  }

  calculateCartTotals(cart);

  await saveCartRepo(cart);

  return await findCartByUserRepo(userId);
};

// Clear Cart

export const clearCartService = async (userId) => {
  const cart = await getOrCreateCart(userId);

  cart.items = [];

  calculateCartTotals(cart);

  await saveCartRepo(cart);

  return await findCartByUserRepo(userId);
};
