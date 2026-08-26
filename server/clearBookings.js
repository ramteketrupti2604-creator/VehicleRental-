import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/bookingModel.js';
dotenv.config();
mongoose.connect(process.env.MONGO_URI).then(async()=>{
  const result = await Booking.deleteMany({});
  console.log(`Deleted ${result.deletedCount} bookings ✅`);
  console.log('Ab sab gaadiya available hai - Point 8 clear');
  process.exit();
});