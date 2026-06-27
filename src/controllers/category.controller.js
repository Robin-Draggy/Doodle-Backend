import {
  createCategoryService,
  getCategoryByIdService,
  getCategoryService,
  updateCategoryService,
  updateCategoryStatusService,
} from "../services/category.service.js";

import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
  uploadImages,
  rollbackUploadedImages,
  deleteImages,
  parseJsonField,
} from "../utils/constants.js";

// GET ALL CATEGORIES

export const getCategories = AsyncHandler(async (req, res) => {
  const categories = await getCategoryService(req.query);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categories,
        "Categories fetched successfully."
      )
    );
});

// GET CATEGORY BY ID

export const getCategoryById = AsyncHandler(async (req, res) => {
  const category = await getCategoryByIdService(req.params.categoryId);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        category,
        "Category fetched successfully."
      )
    );
});

// CREATE CATEGORY

export const createCategory = AsyncHandler(async (req, res) => {
  const file = req.file;

  const data = {
    ...req.body,
    seo: parseJsonField(req.body.seo),
  };

  let uploadedImage = null;

  try {
    if (file) {
      const [image] = await uploadImages([file]);
      uploadedImage = image;
      data.image = image;
    }

    const category = await createCategoryService(data);

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          category,
          "Category created successfully."
        )
      );
  } catch (error) {
    if (uploadedImage) {
      await rollbackUploadedImages([uploadedImage]);
    }

    throw error;
  }
});

// UPDATE CATEGORY

export const updateCategory = AsyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const file = req.file;

  const data = {
    ...req.body,
    seo: parseJsonField(req.body.seo),
  };

  let uploadedImage = null;

  try {
    if (file) {
      const [image] = await uploadImages([file]);

      uploadedImage = image;

      data.image = image;
    }

    const category = await updateCategoryService(categoryId, data);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          category,
          "Category updated successfully."
        )
      );
  } catch (error) {
    if (uploadedImage) {
      await rollbackUploadedImages([uploadedImage]);
    }

    throw error;
  }
});

// UPDATE STATUS

export const updateCategoryStatus = AsyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    throw new ApiError(400, "Invalid category status.");
  }

  const category = await updateCategoryStatusService(
    categoryId,
    status
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        category,
        `Category ${status} successfully.`
      )
    );
});