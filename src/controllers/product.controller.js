import { findProductByIdRepo } from '../repositories/product.repository.js';
import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  getProductService,
  updateProductService,
} from '../services/product.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.js';

export const getProducts = AsyncHandler(async (req, res) => {
  const queryString = req.query;

  const products = await getProductService(queryString);

  if (!products) {
    throw new ApiError(400, 'Products fetch failed');
  }

  res.status(200).json(new ApiResponse(200, products, 'Products fetched successfully'));
});

export const getProductById = AsyncHandler(async (req, res) => {
  const productId = req.params.productId;

  const product = await getProductByIdService(productId);

  if (!product) {
    throw new ApiError(400, 'Product fetch failed');
  }

  res.status(200).json(new ApiResponse(200, product, 'Product fetched successfully'));
});

export const createProduct = AsyncHandler(async (req, res) => {
  const data = req.body;
  const files = req.files;

  let imageUrls = [];

  if (files && files.length > 0) {
    for (const file of files) {
      const uploaded = await uploadOnCloudinary(file.path);
      imageUrls.push(uploaded.secure_url);
    }
  }
  const product = await createProductService({
    ...data,
    images: imageUrls,
  });

  if (!product) {
    throw new ApiError(400, 'Product fetch failed');
  }

  res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

export const updateProduct = AsyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const data = req.body;
  const files = req.files;

  let imageUrls = [];

  // 1. Upload new images if provided
  if (files && files.length > 0) {
    for (const file of files) {
      const uploaded = await uploadOnCloudinary(file.path);
      imageUrls.push(uploaded.secure_url);
    }
  }

  // 2. Get existing product
  const existingProduct = await findProductByIdRepo(productId);
  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  // 3. Merge images (important)
  let finalImages = existingProduct.images;

  if (imageUrls.length > 0) {
    finalImages = [...existingProduct.images, ...imageUrls];
  }

  // 4. Update product
  const updatedProduct = await updateProductService(productId, {
    ...data,
    images: finalImages
  });

  res.status(200).json(
    new ApiResponse(200, updatedProduct, "Product updated successfully")
  );
});

export const deleteProduct = AsyncHandler(async (req, res) => {
  const productId = req.params.productId;

  await deleteProductService(productId);

  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});
