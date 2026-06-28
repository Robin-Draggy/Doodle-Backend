import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
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
      enum: ['user', 'admin'],
      default: 'user',
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

    emailVerificationToken: {
      type: String
    },

    emailVerificationExpiry: {
      type: Date
    },

    resetPasswordToken: {
      type: String
    },

    resetPasswordExpiry: {
      type: Date
    }
  },
  { timestamps: true }
);

//   HASHING PASSWORD
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

//   COMPARING PASSWORD
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// EMAIL VERIFICATION
userSchema.methods.generateEmailVerificationToken = function () {
  // generate raw token
  const token = crypto.randomBytes(32).toString("hex");

  // hash token before saving (security)
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.emailVerificationToken = hashedToken;

  this.emailVerificationExpiry = Date.now() + 1000 * 60 * 60; // 1 hour

  return token; // send this via email
};

// PASSWORD RESET TOKEN
userSchema.methods.generateResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.resetPasswordToken = hashedToken;
  this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min

  return token;
};

// GENERATE ACCESS TOKEN
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// GENERATE REFRESH TOKEN
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model('User', userSchema);
