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
        status: "published",
    });
};