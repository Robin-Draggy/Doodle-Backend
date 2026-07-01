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
      unique: true,
      index: true,
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
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },

    avatar: {
      type: String,
      default: '',
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordExpiry: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ======================================
   Indexes
====================================== */

userSchema.index({
  email: 1,
});

userSchema.index({
  username: 1,
});

userSchema.index({
  role: 1,
});

userSchema.index({
  isVerified: 1,
});

/* ======================================
   Password Hashing
====================================== */

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  this.password = await bcrypt.hash(this.password, saltRounds);
});

/* ======================================
   Instance Methods
====================================== */

// Compare Password

userSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate Email Verification Token

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');

  this.emailVerificationExpiry = new Date(Date.now() + 60 * 60 * 1000);

  return token;
};

// Generate Password Reset Token

userSchema.methods.generateResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  this.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);

  return token;
};

// Generate Access Token

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate Refresh Token

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

/* ======================================
   Transform Output
====================================== */

userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpiry;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpiry;

    return ret;
  },
});

userSchema.set('toObject', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpiry;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpiry;

    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
