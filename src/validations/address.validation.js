import { z } from 'zod';

// Address Validation

const addressSchema = {
  fullName: z.string().trim().min(2, 'Full name is required.').max(100),

  phone: z.string().trim().min(6, 'Phone number is required.').max(20),

  country: z.string().trim().min(2).max(100).default('Bangladesh'),

  division: z.string().trim().min(2).max(100),

  district: z.string().trim().min(2).max(100),

  area: z.string().trim().min(2).max(150),

  postalCode: z.string().trim().min(2).max(20),

  addressLine: z.string().trim().min(5).max(300),

  landmark: z.string().trim().max(200).optional(),

  label: z.enum(['Home', 'Office', 'Other']),
};

// Create Address

export const createAddressSchema = z.object(addressSchema);

// Update Address

export const updateAddressSchema = z.object(addressSchema).partial();
