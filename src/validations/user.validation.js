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