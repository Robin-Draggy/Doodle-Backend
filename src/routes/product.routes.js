import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/product.controller.js';
import { verify } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.check.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { createProductSchema, updateProductSchema } from '../validations/product.validation.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';
import { MAX_IMAGE_UPLOAD } from '../config/constants.js';

export const router = Router();

router
  .route('/')
  .get(getProducts)
  .post(
    verify,
    authorize('admin'),
    upload.array('images', MAX_IMAGE_UPLOAD),
    validate(createProductSchema),
    createProduct
  );

router
  .route('/:productId')
  .all(validateObjectId('productId', 'product'))
  .get(getProductById)
  .patch(
    verify,
    authorize('admin'),
    upload.array('images', MAX_IMAGE_UPLOAD),
    validate(updateProductSchema),
    updateProduct
  )
  .delete(verify, authorize('admin'), deleteProduct);
