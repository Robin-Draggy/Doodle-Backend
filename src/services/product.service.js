import { Product } from '../models/product.model.js';
import { ApiFeatures } from '../utils/ApiFeatures.js';
import { ApiError } from '../utils/ApiError.js';
import { redis } from '../utils/Redis.js';

export const getProductService = async (queryString) => {
  const cacheKey = `products:${JSON.stringify(
    Object.keys(queryString)
      .sort()
      .reduce((a, k) => ((a[k] = queryString[k]), a), {})
  )}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const baseQuery = Product.find();

  const features = new ApiFeatures(baseQuery, queryString).filter().search();

  const total = await features.query.clone().countDocuments();

  features.sort().paginate();

  const products = await features.query.lean();

  const page = parseInt(queryString.page) || 1;
  const limit = parseInt(queryString.limit) || 10;

  const result = {
    data: products,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };

  await redis.set(cacheKey, JSON.stringify(result), 'EX', 120);

  return result;
};

export const getProductByIdService = async (productId) => {
  const cacheKey = `product:${productId}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const product = await Product.findById(productId).lean();

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  await redis.set(cacheKey, JSON.stringify(product), 'EX', 300);

  return product;
};

export const createProductService = async (data) => {
  const product = await Product.create(data);

  const keys = await redis.keys('products:*');
  if (keys.length) await redis.del(keys);

  return product;
};

export const updateProductService = async (productId, data) => {
  const product = await Product.findByIdAndUpdate(productId, data, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  await redis.del(`product:${productId}`);
  return product;
};

export const deleteProductService = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  await redis.del(`product:${productId}`);
  return product;
};
