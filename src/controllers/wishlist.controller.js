import {
  addToWishlistService,
  checkWishlistService,
  getWishlistService,
  removeFromWishlistService,
} from "../services/wishlist.service.js";

import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Get the user's wishlist, creating one if it doesn't exist

export const getWishlist = AsyncHandler(async (req, res) => {
  const wishlist = await getWishlistService(req.user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      wishlist,
      "Wishlist fetched successfully."
    )
  );
});

// Add a product to the wishlist

export const addToWishlist = AsyncHandler(async (req, res) => {
  const { product } = req.body;

  const wishlist = await addToWishlistService(
    req.user._id,
    product
  );

  res.status(201).json(
    new ApiResponse(
      201,
      wishlist,
      "Product added to wishlist."
    )
  );
});

// Remove a product from the wishlist

export const removeFromWishlist = AsyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await removeFromWishlistService(
    req.user._id,
    productId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      wishlist,
      "Product removed from wishlist."
    )
  );
});

// Check if a product is in the wishlist

export const checkWishlist = AsyncHandler(async (req, res) => {
  const { productId } = req.params;

  const result = await checkWishlistService(
    req.user._id,
    productId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Wishlist status fetched successfully."
    )
  );
});