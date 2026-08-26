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
    // NOTE: password yaha plain de, model ke pre-save hook se hash hoga

    const vehicles = [
      { name: 'Maruti Swift', brand: 'Maruti Suzuki', model: 'VXI', category: catMap['Hatchback'], registrationNumber: 'MH31AB1001', year: 2023, fuelType: 'Petrol', transmission: 'Manual', seats: 5, pricePerDay: 1500, location: 'Nagpur', images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80'], description: 'Fuel efficient city car', features: ['AC','Music'], status: 'AVAILABLE' },
      { name: 'Hyundai Creta', brand: 'Hyundai', model: 'SX', category: catMap['SUV'], registrationNumber: 'MH31AB1002', year: 2024, fuelType: 'Diesel', transmission: 'Automatic', seats: 5, pricePerDay: 3500, location: 'Nagpur', images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80'], description: 'Premium SUV', features: ['Sunroof'], status: 'AVAILABLE' },
      { name: 'Toyota Innova Crysta', brand: 'Toyota', model: 'Crysta', category: catMap['MUV'], registrationNumber: 'MH31AB1003', year: 2023, fuelType: 'Diesel', transmission: 'Manual', seats: 7, pricePerDay: 4000, location: 'Wardha', images: ['https://images.unsplash.com/photo-1511919884226-fd3ec7956e9d?w=600&q=80'], description: 'Spacious MUV', features: ['7 Seats'], status: 'AVAILABLE' },
      { name: 'Honda City', brand: 'Honda', model: 'ZX', category: catMap['Sedan'], registrationNumber: 'MH31AB1004', year: 2024, fuelType: 'Petrol', transmission: 'Automatic', seats: 5, pricePerDay: 2500, location: 'Nagpur', images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600&q=80'], description: 'Comfortable sedan', features: ['Leather'], status: 'AVAILABLE' },
      { name: 'Tata Nexon EV', brand: 'Tata', model: 'EV Max', category: catMap['Electric'], registrationNumber: 'MH31AB1005', year: 2024, fuelType: 'Electric', transmission: 'Automatic', seats: 5, pricePerDay: 3000, location: 'Nagpur', images: ['https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=600&q=80'], description: 'Electric SUV', features: ['Fast Charge'], status: 'AVAILABLE' },
      { name: 'Mercedes E-Class', brand: 'Mercedes', model: 'E220d', category: catMap['Luxury'], registrationNumber: 'MH31AB1006', year: 2024, fuelType: 'Diesel', transmission: 'Automatic', seats: 5, pricePerDay: 12000, location: 'Nagpur', images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80'], description: 'Luxury sedan', features: ['Sunroof'], status: 'AVAILABLE' },
      { name: 'Mahindra Thar', brand: 'Mahindra', model: '4x4', category: catMap['SUV'], registrationNumber: 'MH31AB1007', year: 2023, fuelType: 'Diesel', transmission: 'Manual', seats: 4, pricePerDay: 4500, location: 'Wardha', images: ['https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=600&q=80'], description: 'Off-road king', features: ['4x4'], status: 'AVAILABLE' },
      { name: 'Maruti Baleno', brand: 'Maruti Suzuki', model: 'Alpha', category: catMap['Hatchback'], registrationNumber: 'MH31AB1008', year: 2024, fuelType: 'Petrol', transmission: 'Manual', seats: 5, pricePerDay: 1800, location: 'Nagpur', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80'], description: 'Premium hatchback', features: ['GPS'], status: 'AVAILABLE' },
      { name: 'Kia Seltos', brand: 'Kia', model: 'GTX', category: catMap['SUV'], registrationNumber: 'MH31AB1009', year: 2024, fuelType: 'Petrol', transmission: 'Automatic', seats: 5, pricePerDay: 3800, location: 'Nagpur', images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80'], description: 'Feature SUV', features: ['Camera'], status: 'AVAILABLE' },
      { name: 'Ford Endeavour', brand: 'Ford', model: 'Titanium', category: catMap['SUV'], registrationNumber: 'MH31AB1010', year: 2023, fuelType: 'Diesel', transmission: 'Automatic', seats: 7, pricePerDay: 8000, location: 'Wardha', images: ['https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&q=80'], description: 'Full size SUV', features: ['4x4'], status: 'AVAILABLE' },
      { name: 'BMW 5 Series', brand: 'BMW', model: '530d', category: catMap['Luxury'], registrationNumber: 'MH31AB1011', year: 2024, fuelType: 'Diesel', transmission: 'Automatic', seats: 5, pricePerDay: 11000, location: 'Nagpur', images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80'], description: 'German luxury', features: ['Luxury'], status: 'AVAILABLE' },
      { name: 'Audi A6', brand: 'Audi', model: 'Tech', category: catMap['Luxury'], registrationNumber: 'MH31AB1012', year: 2024, fuelType: 'Petrol', transmission: 'Automatic', seats: 5, pricePerDay: 10000, location: 'Wardha', images: ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&q=80'], description: 'Audi luxury', features: ['Luxury'], status: 'AVAILABLE' },
    ];

    await Vehicle.insertMany(vehicles);
    console.log('12 Real Vehicles Imported ✅');
    console.log('Admin: admin@test.com / 123456');
    console.log('User: customer@test.com / 123456');
    process.exit();
  } catch (e) { console.error(e); process.exit(1); }
};
importData();