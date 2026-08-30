import express from 'express';
import User from '../models/userModel.js';
import Vehicle from '../models/vehicleModel.js';
import Category from '../models/categoryModel.js';
import Booking from '../models/bookingModel.js';
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    await Vehicle.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    const categories = await Category.insertMany([
      { name: 'Hatchback' }, { name: 'Sedan' }, { name: 'SUV' },
      { name: 'MUV' }, { name: 'Luxury' }, { name: 'Electric' }
    ]);
    await User.create([
      { name: 'Admin', email: 'admin@rental.com', phone: '9999999999', password: 'Admin@123', role: 'admin' },
      { name: 'Trupti', email: 'user@rental.com', phone: '8888888888', password: 'User@123', role: 'user' }
    ]);
    res.send('✅ Atlas Seeded! Now try admin@rental.com / Admin@123 on phone');
  } catch (e) { res.status(500).send(e.message); }
});
export default router;