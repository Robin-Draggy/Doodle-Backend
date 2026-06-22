import { Product } from '../models/product.model.js';
import { ApiFeatures } from '../utils/ApiFeatures.js';
import { ApiError } from '../utils/ApiError.js';

// GET ALL PRODUCTS
export const getProductService = async (queryString) => {
  const baseQuery = Product.find();

  const features = new ApiFeatures(baseQuery, queryString)
    .filter()
    .search();

  const total = await features.query.clone().countDocuments();

  features.sort().paginate();

  const products = await features.query.lean();

  const page = parseInt(queryString.page) || 1;
  const limit = parseInt(queryString.limit) || 10;

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
  const product = await Product.create(data);
  return product;
};

// UPDATE PRODUCT
export const updateProductService = async (productId, data) => {
  const product = await Product.findByIdAndUpdate(productId, data, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

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