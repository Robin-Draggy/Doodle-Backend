import { PARSE_JSON_FIELD } from "../config/constants.js";
import { findProductByIdLeanRepo } from "../repositories/product.repository.js";
import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  getProductService,
  updateProductService,
} from "../services/product.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/Cloudinary.js";
import { deleteImages, rollbackUploadedImages, uploadImages } from "../utils/cloudinaryFiles.js";


// GET ALL PRODUCTS

export const getProducts = AsyncHandler(async (req, res) => {
  const products = await getProductService(req.query);

  res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

// GET PRODUCT BY ID

export const getProductById = AsyncHandler(async (req, res) => {
  const product = await getProductByIdService(req.params.productId);

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// CREATE PRODUCT

export const createProduct = AsyncHandler(async (req, res) => {
  const files = req.files || [];

  const data = {
    ...req.body,
    tags: PARSE_JSON_FIELD(req.body.tags),
    specifications: PARSE_JSON_FIELD(req.body.specifications),
  };

  const images = await Promise.all(
    files.map(async (file) => {
      const uploaded = await uploadOnCloudinary(file);

      return {
        url: uploaded.url,
        public_id: uploaded.public_id,
      };
    })
  );
  console.log(req.body);

  const product = await createProductService({
    ...data,
    images,
  });

  res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// UPDATE PRODUCT

export const updateProduct = AsyncHandler(async (req, res) => {
  const { productId } = req.params;
  const files = req.files || [];

  const data = {
    ...req.body,
    tags: PARSE_JSON_FIELD(req.body.tags),
    specifications: PARSE_JSON_FIELD(req.body.specifications),
    removeImages: PARSE_JSON_FIELD(req.body.removeImages),
  };

  const removeImages = data.removeImages || [];
  delete data.removeImages;

  let uploadedImages = [];

  try {
    // Upload new images
    uploadedImages = await uploadImages(files);

    // Update database
    const updatedProduct = await updateProductService(
      productId,
      data,
      {
        uploadedImages,
        removeImages,
      }
    );

    // Delete old Cloudinary images only after DB update succeeds
    await deleteImages(removeImages);

    res.status(200).json(
      new ApiResponse(
        200,
        updatedProduct,
        "Product updated successfully"
      )
    );
  } catch (error) {
    // Rollback newly uploaded images
    await rollbackUploadedImages(uploadedImages);
    throw error;
  }
});

// DELETE PRODUCT

export const deleteProduct = AsyncHandler(async (req, res) => {
  await deleteProductService(req.params.productId);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});