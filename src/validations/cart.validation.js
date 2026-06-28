import { z } from 'zod';

// Add to Cart

export const addToCartSchema = z.object({
  productId: z.string().trim().length(24, 'Invalid product id.'),

  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.').default(1),
});

// Update Cart Item

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
});
