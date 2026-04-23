import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  category: z.string().min(1),
  stock: z.coerce.number().int().min(0).optional(),
});


export const updateProductSchema = createProductSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required to update"
  });