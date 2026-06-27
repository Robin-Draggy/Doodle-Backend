import { z } from "zod";

// Add to Wishlist

export const addToWishlistSchema = z.object({
  product: z
    .string()
    .trim()
    .length(24, "Invalid product id."),
});

// Remove from Wishlist

export const removeFromWishlistSchema = z.object({});