import { Router } from "express";
import { validate } from "../middlewares/validation.middleware.js";
import { addressSchema, registerUserSchema } from "../validations/user.validation.js";
import { addAddress, getProfile, loginUser, logoutUser, registerUser, removeAddress, updateProfile } from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verify } from "../middlewares/auth.middleware.js";

export const router = Router();


router.route("/register").post(
    upload.single("avatar"),
    validate(registerUserSchema), 
    registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verify, logoutUser)
router.route("/profile").get(verify, getProfile);
router.route("/profile").patch(
  verify,
  upload.single("avatar"),
  updateProfile
);

router.route("/address").post(
  verify,
  validate(addressSchema),
  addAddress
);

router.route("/address/:addressId").delete(
  verify,
  removeAddress
);