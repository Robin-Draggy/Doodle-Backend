import { Wishlist } from "../models/wishlist.model.js";

// Create a new wishlist document

export const createWishlistRepo = (data) => {
  return Wishlist.create(data);
};

// Read

export const findWishlistByUserRepo = (userId) => {
  return Wishlist.findOne({ user: userId }).populate({
    path: "products.product",
    select:
      "title slug price discountPrice images stock status brand",
  });
};

export const findWishlistByUserLeanRepo = (userId) => {
  return Wishlist.findOne({ user: userId })
    .populate({
      path: "products.product",
      select:
        "title slug price discountPrice images stock status brand",
    })
    .lean();
};

export const findWishlistDocumentByUserRepo = (userId) => {
  return Wishlist.findOne({ user: userId });
};

// Update a wishlist document

export const saveWishlistRepo = (wishlist) => {
  return wishlist.save();
};

// Delete a product from the wishlist

export const deleteWishlistRepo = (userId) => {
  return Wishlist.findOneAndDelete({
    user: userId,
  });
};