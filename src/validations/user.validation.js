import z from 'zod';

/* =====================================================
   Update Profile
===================================================== */

export const updateProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, 'Username must be at least 2 characters.')
      .max(50, 'Username cannot exceed 50 characters.')
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });
