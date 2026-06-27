import { Product } from '../models/product.model.js';
import { ApiFeatures } from '../utils/ApiFeatures.js';
import { ApiError } from '../utils/ApiError.js';

// GET ALL PRODUCTS
export const getProductService = async (queryString) => {
  const baseQuery = Product.find();

  const features = new ApiFeatures(baseQuery, queryString).filter().search();

  const total = await features.query.clone().countDocuments();

  features.sort().paginate();

  const products = await features.query.lean();

  const page = Number(queryString.page) || 1;
  const limit = Number(queryString.limit) || 10;

  return {
    data: products,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

// GET SINGLE PRODUCT
export const getProductByIdService = async (productId) => {
  const product = await Product.findById(productId).lean();

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

// CREATE PRODUCT
export const createProductService = async (data) => {
  return await Product.create(data);
};

// UPDATE PRODUCT
export const updateProductService = async (
  productId,
  data,
  { uploadedImages = [], removeImages = [] } = {}
) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Determine the final values after the update
  const finalPrice = data.price ?? product.price;
  const finalDiscountPrice =
    data.discountPrice ?? product.discountPrice;

  // Business validation
  if (
    finalDiscountPrice !== null &&
    finalDiscountPrice !== undefined &&
    finalDiscountPrice >= finalPrice
  ) {
    throw new ApiError(
      400,
      "Discount price must be less than the original price."
    );
  }

  // Remove deleted images
  if (removeImages.length) {
    product.images = product.images.filter(
      (image) =>
        !removeImages.some(
          (removed) => removed.public_id === image.public_id
        )
    );
  }

  // Add newly uploaded images
  if (uploadedImages.length) {
    product.images.push(...uploadedImages);
  }

  // Merge incoming fields
  Object.assign(product, data);

  // Trigger validation + middleware
  await product.save();

  return product;
};

// DELETE PRODUCT
export const deleteProductService = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};
