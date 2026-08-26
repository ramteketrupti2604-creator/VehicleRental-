import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const reset = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const updated = await User.findOneAndUpdate(
    { email: 'admin@rental.com' },
    { password: hashedPassword, role: 'admin' },
    { new: true }
  );

  if(updated){
    console.log('✅ Password Reset Ho Gaya!');
    console.log('Email:', updated.email);
    console.log('New Password: Admin@123');
    console.log('Role:', updated.role);
  } else {
    console.log('❌ User nahi mila');
  }
  process.exit();
};

reset();