import { Router } from "express";
import { validate } from "../middlewares/validation.middleware.js";
import { registerUserSchema } from "../validations/user.validation.js";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verify } from "../middlewares/auth.middleware.js";

export const router = Router();


router.route("/register").post(upload.single("avatar"),validate(registerUserSchema), registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verify, logoutUser)