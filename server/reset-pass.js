import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
dotenv.config();

const reset = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  await User.deleteMany({});
  console.log('All users deleted');

  
  const users = await User.create([
    { name: 'Admin', email: 'admin@rental.com', phone: '9999999999', password: 'Admin@123', role: 'admin' },
    { name: 'Trupti', email: 'user@rental.com', phone: '8888888888', password: 'User@123', role: 'user' }
  ]);

  console.log('✅ Created:');
  users.forEach(u => console.log(`${u.email} - ${u.role} - ${u.name}`));
  
  process.exit(0);
};
reset();