import {
  createCategoryRepo,
  findCategoriesRepo,
  findCategoryByIdRepo,
  findCategoryByNameRepo,
  findChildCategoriesRepo,
  updateCategoryRepo,
  updateCategoryStatusRepo,
} from "../repositories/category.repository.js";

import { ApiFeatures } from "../utils/ApiFeatures.js";
import { ApiError } from "../utils/ApiError.js";

// GET ALL CATEGORIES

export const getCategoryService = async (queryString) => {
  const baseQuery = findCategoriesRepo();

  const features = new ApiFeatures(baseQuery, queryString)
    .filter()
    .search();

  const total = await features.query.clone().countDocuments();

  features.sort().paginate();

  const categories = await features.query.lean();

  const page = Number(queryString.page) || 1;
  const limit = Number(queryString.limit) || 10;

  return {
    data: categories,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

// GET CATEGORY BY ID

export const getCategoryByIdService = async (categoryId) => {
  const category = await findCategoryByIdRepo(categoryId).lean();

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  return category;
};

// CREATE CATEGORY

export const createCategoryService = async (data) => {
  // Duplicate name
  const existing = await findCategoryByNameRepo(data.name);

  if (existing) {
    throw new ApiError(409, "Category already exists.");
  }

  // Parent validation
  if (data.parent) {
    const parent = await findCategoryByIdRepo(data.parent);

    if (!parent) {
      throw new ApiError(404, "Parent category not found.");
    }

    if (parent.status !== "active") {
      throw new ApiError(400, "Parent category must be active.");
    }
  }

  return createCategoryRepo(data);
};

//  UPDATE CATEGORY

export const updateCategoryService = async (categoryId, data) => {
  const category = await findCategoryByIdRepo(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  /*
  |-------------------------------------------------------
  | Duplicate name
  |-------------------------------------------------------
  */

  if (data.name && data.name !== category.name) {
    const existing = await findCategoryByNameRepo(data.name);

    if (existing && existing._id.toString() !== categoryId) {
      throw new ApiError(409, "Category name already exists.");
    }
  }

//  Parent validation

  if (data.parent) {
    if (data.parent === categoryId) {
      throw new ApiError(400, "A category cannot be its own parent.");
    }

    const parent = await findCategoryByIdRepo(data.parent);

    if (!parent) {
      throw new ApiError(404, "Parent category not found.");
    }

    if (parent.status !== "active") {
      throw new ApiError(400, "Parent category must be active.");
    }

    /*
    |-------------------------------------------------------
    | Prevent circular hierarchy
    | Example:
    | A -> B -> C
    | C cannot become parent of A
    |-------------------------------------------------------
    */

    let current = parent;

    while (current) {
      if (current._id.toString() === categoryId) {
        throw new ApiError(
          400,
          "Circular category hierarchy is not allowed."
        );
      }

      if (!current.parent) break;

      current = await findCategoryByIdRepo(current.parent);
    }
  }

  Object.assign(category, data);

  await category.save();

  return category;
};

//  CATEGORY STATUS UPDATE


export const updateCategoryStatusService = async (
  categoryId,
  status
) => {
  const category = await findCategoryByIdRepo(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  /*
  |-------------------------------------------------------
  | Prevent deactivating parent categories
  |-------------------------------------------------------
  */

  if (status === "inactive") {
    const children = await findChildCategoriesRepo(categoryId);

    if (children.length) {
      throw new ApiError(
        400,
        "Cannot deactivate a category that has active subcategories."
      );
    }

    // Later:
    // Check if products exist in this category
  }

  return updateCategoryStatusRepo(categoryId, status);
};