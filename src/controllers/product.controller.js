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
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/Cloudinary.js';

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

  console.log(data)
  console.log(files)

  let images = [];

  if (files && files.length > 0) {
    for (const file of files) {
      const uploaded = await uploadOnCloudinary(file);
      console.log("file", file)
      images.push({
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      });
    }
  }

  const product = await createProductService({
    ...data,
    images,
  });

  if (!product) {
    throw new ApiError(400, 'Product fetch failed');
  }

  res.status(201).json(
    new ApiResponse(201, product, 'Product created successfully')
  );
});

export const updateProduct = AsyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const data = req.body;
  const files = req.files;

  const existingProduct = await findProductByIdRepo(productId);

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  // 1. Upload new images (NEW SYSTEM)
  let newImages = [];

  if (files && files.length > 0) {
    const uploads = await Promise.all(
      files.map(file => uploadOnCloudinary(file))
    );

    newImages = uploads.map(u => ({
      url: u.secure_url,
      public_id: u.public_id,
    }));
  }

  // 2. Handle removed images
  let updatedImages = [...existingProduct.images];

  if (data.removeImages) {
    let removeArray = [];

    try {
      removeArray =
        typeof data.removeImages === "string"
          ? JSON.parse(data.removeImages)
          : data.removeImages;
    } catch (e) {
      removeArray = [];
    }

    // remove from cloudinary
    for (const img of removeArray) {
      await deleteFromCloudinary(img.public_id);
    }

    // remove from DB
    updatedImages = updatedImages.filter(
      img => !removeArray.some(r => r.public_id === img.public_id)
    );
  }

  // 3. Add new images
  updatedImages = [...updatedImages, ...newImages];

  // 4. Update product
  const updatedProduct = await updateProductService(productId, {
    ...data,
    images: updatedImages,
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
