import z from "zod";

export const registerUserSchema = z.object({
    username: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50),

    email: z
    .string()
    .email("Invalid email format"),

    password: z
    .string()
    .min(6, "Password must be at least 6 characters")
})

export const updateProfileSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
});

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  addressLine: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
});