import { Router } from "express";
import { validate } from "../middlewares/validation.middleware.js";
import { registerUserSchema } from "../validations/user.validation.js";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'

export const router = Router();


router.route("/register").post(upload.single("avatar"),validate(registerUserSchema), registerUser)