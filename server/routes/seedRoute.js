import express from 'express';
import User from '../models/userModel.js';
import Vehicle from '../models/vehicleModel.js';
import Category from '../models/categoryModel.js';
import Booking from '../models/bookingModel.js';
import Coupon from '../models/couponModel.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await Vehicle.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    await Coupon.deleteMany({});

    const categories = await Category.insertMany([
      { name: 'Hatchback' }, { name: 'Sedan' }, { name: 'SUV' },
      { name: 'MUV' }, { name: 'Luxury' }, { name: 'Electric' }
    ]);
    const getCat = (n) => categories.find(c => c.name === n)._id;

    await Vehicle.insertMany([
      { name: 'Swift', brand: 'Maruti', model: 'VXI 2023', registrationNumber: 'MH01AB0001', category: getCat('Hatchback'), year: 2023, fuelType: 'Petrol', transmission: 'Manual', seats: 5, pricePerDay: 1500, location: 'Pune', status: 'AVAILABLE', images: ['/cars/swift.jpg'], description: 'Best hatchback' },
      { name: 'Baleno', brand: 'Maruti', model: 'Zeta 2023', registrationNumber: 'MH01AB0002', category: getCat('Hatchback'), year: 2023, fuelType: 'Petrol', transmission: 'Manual', seats: 5, pricePerDay: 1600, location: 'Mumbai', status: 'AVAILABLE', images: ['/cars/baleno.jpg'], description: 'Premium hatchback' },
      { name: 'WagonR', brand: 'Maruti', model: 'ZXI 2023', registrationNumber: 'MH01AB0013', category: getCat('Hatchback'), year: 2023, fuelType: 'CNG', transmission: 'Manual', seats: 5, pricePerDay: 1400, location: 'Delhi', status: 'AVAILABLE', images: ['/cars/wagonr.jpg'], description: 'Economy hatchback' },
      { name: 'City', brand: 'Honda', model: 'ZX 2023', registrationNumber: 'MH01AB0003', category: getCat('Sedan'), year: 2023, fuelType: 'Petrol', transmission: 'Automatic', seats: 5, pricePerDay: 2500, location: 'Bengaluru', status: 'AVAILABLE', images: ['/cars/city.jpg'], description: 'Luxury sedan' },
      { name: 'Verna', brand: 'Hyundai', model: 'SX 2023', registrationNumber: 'MH01AB0004', category: getCat('Sedan'), year: 2023, fuelType: 'Diesel', transmission: 'Automatic', seats: 5, pricePerDay: 2400, location: 'Kolkata', status: 'AVAILABLE', images: ['/cars/verna.jpg'], description: 'Sedan' },
      { name: 'Thar', brand: 'Mahindra', model: '4x4 2023', registrationNumber: 'MH01AB0005', category: getCat('SUV'), year: 2023, fuelType: 'Diesel', transmission: 'Manual', seats: 4, pricePerDay: 3500, location: 'Chennai', status: 'AVAILABLE', images: ['/cars/thar.jpg'], description: 'Offroad SUV' },
      { name: 'Fortuner', brand: 'Toyota', model: 'Legender 2023', registrationNumber: 'MH01AB0006', category: getCat('SUV'), year: 2023, fuelType: 'Diesel', transmission: 'Automatic', seats: 7, pricePerDay: 5000, location: 'Hyderabad', status: 'AVAILABLE', images: ['/cars/fortuner.jpg'], description: 'Premium SUV' },
      { name: 'Venue', brand: 'Hyundai', model: 'SX 2023', registrationNumber: 'MH01AB0014', category: getCat('SUV'), year: 2023, fuelType: 'Petrol', transmission: 'Manual', seats: 5, pricePerDay: 2200, location: 'Bhandara', status: 'AVAILABLE', images: ['/cars/venue.jpg'], description: 'Compact SUV' },
      { name: 'Innova', brand: 'Toyota', model: 'Crysta 2023', registrationNumber: 'MH01AB0007', category: getCat('MUV'), year: 2023, fuelType: 'Diesel', transmission: 'Manual', seats: 7, pricePerDay: 3000, location: 'Nagpur', status: 'AVAILABLE', images: ['/cars/innova.jpg'], description: 'Family MUV' },
      { name: 'Ertiga', brand: 'Maruti', model: 'ZXI 2023', registrationNumber: 'MH01AB0008', category: getCat('MUV'), year: 2023, fuelType: 'CNG', transmission: 'Manual', seats: 7, pricePerDay: 2800, location: 'Gujarat', status: 'AVAILABLE', images: ['/cars/ertiga.jpg'], description: 'MUV' },
      { name: 'BMW 5 Series', brand: 'BMW', model: '520d 2023', registrationNumber: 'MH01AB0009', category: getCat('Luxury'), year: 2023, fuelType: 'Petrol', transmission: 'Automatic', seats: 5, pricePerDay: 8000, location: 'Bhopal', status: 'AVAILABLE', images: ['/cars/bmw.jpg'], description: 'Luxury car' },
      { name: 'Nexon EV', brand: 'Tata', model: 'XZ Plus 2023', registrationNumber: 'MH01AB0012', category: getCat('Electric'), year: 2023, fuelType: 'Electric', transmission: 'Automatic', seats: 5, pricePerDay: 3500, location: 'Wardha', status: 'AVAILABLE', images: ['/cars/nexon.jpg'], description: 'Electric SUV' },
    ]);

    await Coupon.insertMany([
      { code: 'WELCOME10', discountType: 'PERCENT', discountValue: 10, minAmount: 1000, maxDiscount: 500, expiryDate: new Date('2027-12-31'), isActive: true, usageLimit: 100, usedCount: 0 },
      { code: 'FLAT200', discountType: 'FLAT', discountValue: 200, minAmount: 1500, expiryDate: new Date('2027-12-31'), isActive: true, usageLimit: 100, usedCount: 0 }
    ]);

    await User.create([
      { name: 'Admin', email: 'admin@rental.com', phone: '9999999999', password: 'Admin@123', role: 'admin' },
      { name: 'Trupti', email: 'user@rental.com', phone: '8888888888', password: 'User@123', role: 'user' }
    ]);

    res.send('✅ Seeded! 12 Vehicles + 2 Coupons added with local images. Try admin@rental.com / Admin@123');
  } catch (e) { console.log(e); res.status(500).send(e.message); }
});
export default router;