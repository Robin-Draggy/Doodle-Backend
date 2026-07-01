import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { DB_NAME } from "../config/constants.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);;

    const existing = await User.findOne({ email: "admin@gmail.com" });

    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    await User.create({
      username: "Admin",
      email: "admin@gmail.com",
      password: "admin123",
      role: "admin",
      isVerified: true,
    });

    console.log("Admin created");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

createAdmin();