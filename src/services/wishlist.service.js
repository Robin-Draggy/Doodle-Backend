import {
  createWishlistRepo,
  findWishlistByUserRepo,
  findWishlistDocumentByUserRepo,
  saveWishlistRepo,
} from '../repositories/wishlist.repository.js';
import { findProductByIdLeanRepo } from '../repositories/product.repository.js';

import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/ApiError.js';

// Get the user's wishlist, creating one if it doesn't exist

export const getWishlistService = async (userId) => {
  let wishlist = await findWishlistByUserRepo(userId);

  if (!wishlist) {
    wishlist = await createWishlistRepo({
      user: userId,
      products: [],
    });

    wishlist = await findWishlistByUserRepo(userId);
  }

  return wishlist;
};

// Add a product to the wishlist

export const addToWishlistService = async (userId, productId) => {
  const product = await findProductByIdLeanRepo(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  if (product.status !== 'published') {
    throw new ApiError(400, 'Only published products can be added to wishlist.');
  }

  let wishlist = await findWishlistDocumentByUserRepo(userId);

  if (!wishlist) {
    wishlist = await createWishlistRepo({
      user: userId,
      products: [],
    });

    wishlist = await findWishlistDocumentByUserRepo(userId);
  }

  const alreadyExists = wishlist.products.some(
    (item) => item.product.toString() === productId.toString()
  );

  if (alreadyExists) {
    throw new ApiError(409, 'Product already exists in wishlist.');
  }

  wishlist.products.push({
    product: productId,
  });

  await saveWishlistRepo(wishlist);

  return await findWishlistByUserRepo(userId);
};

// Remove a product from the wishlist

export const removeFromWishlistService = async (userId, productId) => {
  const wishlist = await findWishlistDocumentByUserRepo(userId);

  if (!wishlist) {
    throw new ApiError(404, 'Wishlist not found.');
  }

  const initialLength = wishlist.products.length;

  wishlist.products = wishlist.products.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  if (wishlist.products.length === initialLength) {
    throw new ApiError(404, 'Product not found in wishlist.');
  }

  await saveWishlistRepo(wishlist);

  return await findWishlistByUserRepo(userId);
};

// Check if a product is in the user's wishlist

export const checkWishlistService = async (userId, productId) => {
  const wishlist = await findWishlistByUserRepo(userId);

  if (!wishlist) {
    return {
      wishlisted: false,
    };
  }

  const wishlisted = wishlist.products.some(
    (item) => item.product._id.toString() === productId.toString()
  );

  return {
    wishlisted,
  };
};
