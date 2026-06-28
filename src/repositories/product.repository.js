import { Product } from '../models/product.model.js';

export const findProductsRepo = (query) => query.lean();

export const countProductsRepo = (query) => query.countDocuments();

export const findProductByIdRepo = (productId) => Product.findById(productId);

export const findProductByIdLeanRepo = (productId) => Product.findById(productId).lean();

export const createProductRepo = (data) => Product.create(data);

export const saveProductRepo = (product) => product.save();

export const deleteProductRepo = (productId) => Product.findByIdAndDelete(productId);

export const countProductsInCategoryRepo = (categoryId) => {
  return Product.countDocuments({
    category: categoryId,
    status: 'published',
  });
};

// Save Product

export const saveProductRepo = (product, options = {}) => {
  return product.save(options);
};

// Reserve Product Stock

export const reserveProductStockRepo = (productId, quantity, options = {}) => {
  return Product.findOneAndUpdate(
    {
      _id: productId,
      stock: {
        $gte: quantity,
      },
    },
    {
      $inc: {
        stock: -quantity,
      },
    },
    {
      new: true,
      session: options.session,
    }
  );
};

// Restore Product Stock

export const restoreProductStockRepo = (productId, quantity, options = {}) => {
  return Product.findByIdAndUpdate(
    productId,
    {
      $inc: {
        stock: quantity,
      },
    },
    {
      new: true,
      session: options.session,
    }
  );
};
