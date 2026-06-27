import { Category } from "../models/category.model.js";

/**
 * Create
 */
export const createCategoryRepo = (data) => {
  return Category.create(data);
};

/**
 * Find One
 */
export const findCategoryByIdRepo = (categoryId) => {
  return Category.findById(categoryId);
};

export const findCategoryByIdLeanRepo = (categoryId) => {
  return Category.findById(categoryId).lean();
};

export const findCategoryBySlugRepo = (slug) => {
  return Category.findOne({ slug }).lean();
};

export const findCategoryByNameRepo = (name) => {
  return Category.findOne({ name });
};

/**
 * Find Many
 */
export const findCategoriesRepo = (filter = {}) => {
  return Category.find(filter);
};

export const findCategoriesLeanRepo = (filter = {}) => {
  return Category.find(filter).lean();
};

export const findFeaturedCategoriesRepo = () => {
  return Category.find({
    isFeatured: true,
    status: "active",
  })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
};

/**
 * Update
 */
export const updateCategoryRepo = (categoryId, data) => {
  return Category.findByIdAndUpdate(categoryId, data, {
    new: true,
    runValidators: true,
  });
};

/**
 * Activate/Deactivate
 */
export const updateCategoryStatusRepo = (categoryId, status) => {
  return Category.findByIdAndUpdate(
    categoryId,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );
};


/**
 * FInd Child Categories
 */
export const findChildCategoriesRepo = (parentId) => {
  return Category.find({
    parent: parentId,
    status: "active",
  }).lean();
};