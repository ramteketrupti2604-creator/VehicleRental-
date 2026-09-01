import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
dotenv.config();

const fix = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB Connected');

  
  const admin = await User.findOneAndUpdate(
    { email: 'admin@rental.com' },
    { role: 'admin', name: 'Admin' },
    { new: true }
  );
  console.log('Admin fixed:', admin);

 
  const user = await User.findOneAndUpdate(
    { email: 'user@rental.com' },
    { role: 'user', name: 'Trupti' },
    { new: true }
  );
  console.log('User fixed:', user);

  
  const all = await User.find({}, 'name email role');
  console.log('All users:', all);

  process.exit(0);
};
fix();