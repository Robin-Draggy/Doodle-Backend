import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, 
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    avatar: {
      type: String, 
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },
  }, {timestamps: true})

//   HASHING PASSWORD
  userSchema.pre("save", async function (){
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
  });

//   COMPARING PASSWORD
  userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
  }

//   GENERATING ACCESS TOKEN
  userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
    )
  }

//   GENERATING REFRESH TOKEN
  userSchema.methods.generateRefreshToken = function (){
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
)
  }

export const User = mongoose.model("User", userSchema)