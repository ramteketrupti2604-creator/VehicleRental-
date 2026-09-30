import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Vehicle from './models/vehicleModel.js';
import User from './models/userModel.js';
import Category from './models/categoryModel.js';
import Booking from './models/bookingModel.js';

dotenv.config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    await Vehicle.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();
    await Booking.deleteMany();
    console.log('Old Data Deleted');

    const categories = await Category.insertMany([
      { name: 'Hatchback', description: 'Small city cars' },
      { name: 'Sedan', description: 'Comfortable 4 door cars' },
      { name: 'SUV', description: 'Sport Utility Vehicles' },
      { name: 'MUV', description: 'Multi Utility Vehicles' },
      { name: 'Luxury', description: 'Premium cars' },
      { name: 'Electric', description: 'EV Cars' },
    ]);

    const catMap = {};
    categories.forEach(c => catMap[c.name] = c._id);

    await User.create([
      { name: 'Admin User', email: 'admin@test.com', phone: '9999999999', password: '123456', role: 'admin' },
      { name: 'Test Customer', email: 'customer@test.com', phone: '8888888888', password: '123456', role: 'user' }
    ]);
    
    const vehicles = [
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
    ];

    await Vehicle.insertMany(vehicles);
    console.log('12 Real Vehicles Imported ✅');
    console.log('Admin: admin@test.com / 123456');
    console.log('User: customer@test.com / 123456');
    process.exit();
  } catch (e) { console.error(e); process.exit(1); }
};
importData();