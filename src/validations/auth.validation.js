import z from 'zod';

/* =====================================================
   Shared Schemas
===================================================== */

const emailSchema = z.string().trim().toLowerCase().email('Invalid email address.');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(100, 'Password is too long.');

/* =====================================================
   Register
===================================================== */

export const registerUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, 'Username must be at least 2 characters.')
    .max(50, 'Username cannot exceed 50 characters.'),

  email: emailSchema,

  password: passwordSchema,
});

/* =====================================================
   Login
===================================================== */

export const loginUserSchema = z.object({
  email: emailSchema,

  password: z.string().min(1, 'Password is required.'),
});

/* =====================================================
   Refresh Token
===================================================== */

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required.'),
});

/* =====================================================
   Resend Verification Email
===================================================== */

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

/* =====================================================
   Forgot Password
===================================================== */

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/* =====================================================
   Reset Password
===================================================== */

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

/* =====================================================
   Change Password
===================================================== */

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),

    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password.',
    path: ['newPassword'],
  });
