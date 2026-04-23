import { Router } from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/product.controller.js";
import { verify } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.check.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createProductSchema, updateProductSchema } from "../validations/product.validation.js";


export const router = Router();

router.route("/")
  .get(getProducts)
  .post(
    verify,
    // authorize("admin"),
    upload.array("images", 5),
    validate(createProductSchema),
    createProduct
  );

router.route("/:productId")
  .get(getProductById)
  .put(
    verify,
    // authorize("admin"),
    upload.array("images", 5),
    validate(updateProductSchema),
    updateProduct
  )
  .delete(
    verify,
    // authorize("admin"),
    deleteProduct
  );