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
  const files = req.files || [];

  let images = [];

  if (files.length > 0) {
    images = await Promise.all(
      files.map(async (file) => {
        const uploaded = await uploadOnCloudinary(file);

        return {
          url: uploaded.url,
          public_id: uploaded.public_id,
        };
      })
    );
  }

  const product = await createProductService({
    ...data,
    images,
  });

  res.status(201).json(
    new ApiResponse(201, product, "Product created successfully")
  );
});

export const updateProduct = AsyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = req.body;
  const files = req.files || [];

  const existingProduct = await findProductByIdRepo(productId);

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  // Upload newly added images
  let newImages = [];

  if (files.length > 0) {
    const uploads = await Promise.all(
      files.map((file) => uploadOnCloudinary(file))
    );

    newImages = uploads.map((image) => ({
      url: image.url,
      public_id: image.public_id,
    }));
  }

  // Existing images
  let updatedImages = [...existingProduct.images];

  // Images to remove
  if (data.removeImages) {
    let removeImages = [];

    try {
      removeImages =
        typeof data.removeImages === "string"
          ? JSON.parse(data.removeImages)
          : data.removeImages;
    } catch {
      throw new ApiError(400, "Invalid removeImages format");
    }

    await Promise.all(
      removeImages.map((img) =>
        deleteFromCloudinary(img.public_id)
      )
    );

    updatedImages = updatedImages.filter(
      (img) =>
        !removeImages.some(
          (removed) => removed.public_id === img.public_id
        )
    );
  }

  // Merge images
  updatedImages.push(...newImages);

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
