import { Router } from 'express';

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} from '../controllers/cart.controller.js';

import { verify } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

import { addToCartSchema, updateCartItemSchema } from '../validations/cart.validation.js';

export const router = Router();

// Cart

router
  .route('/')
  .get(verify, getCart)
  .post(verify, validate(addToCartSchema), addToCart)
  .delete(verify, clearCart);

router.get('/count', verify, getCartCount);

// Update and Remove Cart Item

router
  .route('/:productId')
  .patch(verify, validateObjectId('productId'), validate(updateCartItemSchema), updateCartItem)
  .delete(verify, validateObjectId('productId'), removeFromCart);
