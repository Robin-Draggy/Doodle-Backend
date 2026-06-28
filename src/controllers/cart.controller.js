import {
  addToCartService,
  clearCartService,
  getCartService,
  removeFromCartService,
  updateCartItemService,
} from '../services/cart.service.js';

import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get Cart

export const getCart = AsyncHandler(async (req, res) => {
  const cart = await getCartService(req.user._id);

  res.status(200).json(new ApiResponse(200, cart, 'Cart fetched successfully.'));
});

// Add to Cart

export const addToCart = AsyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const cart = await addToCartService(req.user._id, productId, quantity);

  res.status(201).json(new ApiResponse(201, cart, 'Product added to cart.'));
});

// Update Cart Item

export const updateCartItem = AsyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await updateCartItemService(req.user._id, productId, quantity);

  res.status(200).json(new ApiResponse(200, cart, 'Cart updated successfully.'));
});

// Remove Item from Cart

export const removeFromCart = AsyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await removeFromCartService(req.user._id, productId);

  res.status(200).json(new ApiResponse(200, cart, 'Product removed from cart.'));
});

// Clear Cart

export const clearCart = AsyncHandler(async (req, res) => {
  const cart = await clearCartService(req.user._id);

  res.status(200).json(new ApiResponse(200, cart, 'Cart cleared successfully.'));
});

// Cart Total Count

export const getCartCount = AsyncHandler(async (req, res) => {
  const cart = await getCartService(req.user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        count: cart.totalItems,
      },
      'Cart count fetched successfully.'
    )
  );
});
