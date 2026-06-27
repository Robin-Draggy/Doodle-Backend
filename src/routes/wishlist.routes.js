import { Router } from "express";

import {
  addToWishlist,
  checkWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";

import { verify } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";

import { addToWishlistSchema } from "../validations/wishlist.validation.js";

export const router = Router();

// Wishlist

router
  .route("/")
  .get(
    verify,
    getWishlist
  )
  .post(
    verify,
    validate(addToWishlistSchema),
    addToWishlist
  );

// Remove a product from the wishlist

router.delete(
  "/:productId",
  verify,
  validateObjectId("productId"),
  removeFromWishlist
);

// Check if a product is in the wishlist

router.get(
  "/check/:productId",
  verify,
  validateObjectId("productId"),
  checkWishlist
);