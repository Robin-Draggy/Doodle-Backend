import { Product } from "../models/product.model.js";

export const createProductRepo = (data) => Product.create(data, {runValidators: true});

export const findProductByIdRepo = (productId) => Product.findById(productId).lean();

export const updateProductRepo = (productId, data) => Product.findByIdAndUpdate(productId, data, { new: true, runValidators: true });


export const deleteProductRepo = (productId) => Product.findByIdAndDelete(productId)