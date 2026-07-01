import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { User } from '../models/user.model.js';
import { DB_NAME } from '../config/constants.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists.');
      return;
    }

    await User.create({
      username: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
    });

    console.log('✅ Admin account created.');
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

createAdmin();
