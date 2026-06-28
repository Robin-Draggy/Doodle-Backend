import { Router } from 'express';

import {
  createAddress,
  deleteAddress,
  getAddressById,
  getAddresses,
  getDefaultAddress,
  setDefaultAddress,
  updateAddress,
} from '../controllers/address.controller.js';

import { verify } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

import { createAddressSchema, updateAddressSchema } from '../validations/address.validation.js';

export const router = Router();


router
  .route('/')
  .get(verify, getAddresses)
  .post(verify, validate(createAddressSchema), createAddress);

// Get Default Address

router.get('/default', verify, getDefaultAddress);

// Get, Update, Delete Address by ID

router
  .route('/:addressId')
  .get(verify, validateObjectId('addressId'), getAddressById)
  .put(verify, validateObjectId('addressId'), validate(updateAddressSchema), updateAddress)
  .delete(verify, validateObjectId('addressId'), deleteAddress);

// Set Default Address

router.patch('/:addressId/default', verify, validateObjectId('addressId'), setDefaultAddress);
