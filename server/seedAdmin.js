import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  await User.deleteOne({ email: 'admin@test.com' });

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: await bcrypt.hash('123456', 10),
    role: 'admin',
    phone: '9999999999'
  });
  console.log('Admin Created:', admin);
  process.exit();
}
seedAdmin();