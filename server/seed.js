import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Vehicle from './models/vehicleModel.js';
import Category from './models/categoryModel.js';
import User from './models/userModel.js';
import Booking from './models/bookingModel.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB:', mongoose.connection.name);

    await Vehicle.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});

    const categories = await Category.insertMany([
      { name: 'Hatchback' }, { name: 'Sedan' }, { name: 'SUV' },
      { name: 'MUV' }, { name: 'Luxury' }, { name: 'Electric' }
    ]);
    const catMap = Object.fromEntries(categories.map(c => [c.name, c._id]));

    // FIX: Plain password bhejo, Model khud hash karega - double hash nahi hoga
    await User.create([
      { name: 'Admin', email: 'admin@rental.com', phone: '9999999999', password: 'Admin@123', role: 'admin' },
      { name: 'Trupti', email: 'user@rental.com', phone: '8888888888', password: 'User@123', role: 'user' }
    ]);

    const vehicles = [
      {
        name: "Swift", brand: "Maruti", model: "VXI", category: catMap['Hatchback'], registrationNumber: "MH31AB1111", year: 2024, fuelType: "Petrol", transmission: "Manual", seats: 5, pricePerDay: 1600, location: "Wardha",
        images: ["/cars/swift.jpg"],
        description: "Most loved hatchback", features: ["AC","Airbags"], status: "AVAILABLE"
      },
      {
        name: "Baleno", brand: "Maruti", model: "Alpha", category: catMap['Hatchback'], registrationNumber: "MH31AB1112", year: 2023, fuelType: "Petrol", transmission: "Manual", seats: 5, pricePerDay: 1800, location: "Wardha",
        images: ["/cars/baleno.jpg"],
        description: "Premium hatchback", features: ["AC"], status: "AVAILABLE"
      },
      {
        name: "Thar", brand: "Mahindra", model: "LX 4x4", category: catMap['SUV'], registrationNumber: "MH31AB1113", year: 2023, fuelType: "Diesel", transmission: "Manual", seats: 4, pricePerDay: 5000, location: "Nagpur",
        images: ["/cars/thar.jpg"],
        description: "Offroad king 4x4", features: ["4x4"], status: "AVAILABLE"
      },
      {
        name: "Fortuner", brand: "Toyota", model: "Legender", category: catMap['SUV'], registrationNumber: "MH31AB1114", year: 2024, fuelType: "Diesel", transmission: "Automatic", seats: 7, pricePerDay: 8000, location: "Nagpur",
        images: ["/cars/fortuner.jpg"],
        description: "Luxury 7 seater SUV", features: ["Leather Seats"], status: "AVAILABLE"
      },
      {
        name: "Innova Crysta", brand: "Toyota", model: "Z", category: catMap['MUV'], registrationNumber: "MH31AB1115", year: 2023, fuelType: "Diesel", transmission: "Manual", seats: 7, pricePerDay: 4500, location: "Wardha",
        images: ["/cars/innova.jpg"],
        description: "Spacious family MUV", features: ["7 Seats"], status: "AVAILABLE"
      },
      {
        name: "City", brand: "Honda", model: "ZX CVT", category: catMap['Sedan'], registrationNumber: "MH31AB1116", year: 2024, fuelType: "Petrol", transmission: "Automatic", seats: 5, pricePerDay: 2500, location: "Wardha",
        images: ["/cars/city.jpg"],
        description: "Premium sedan", features: ["Sunroof"], status: "AVAILABLE"
      },
      {
        name: "Venue", brand: "Hyundai", model: "SX", category: catMap['SUV'], registrationNumber: "MH31AB1117", year: 2024, fuelType: "Petrol", transmission: "Automatic", seats: 5, pricePerDay: 2800, location: "Wardha",
        images: ["/cars/venue.jpg"],
        description: "Compact SUV with sunroof", features: ["Sunroof"], status: "AVAILABLE"
      },
      {
        name: "Nexon EV", brand: "Tata", model: "Max", category: catMap['Electric'], registrationNumber: "MH31AB1118", year: 2024, fuelType: "Electric", transmission: "Automatic", seats: 5, pricePerDay: 3000, location: "Wardha",
        images: ["/cars/nexon.jpg"],
        description: "Electric SUV", features: ["Fast Charging"], status: "AVAILABLE"
      },
      {
        name: "BMW X5", brand: "BMW", model: "xDrive40i", category: catMap['Luxury'], registrationNumber: "MH31AB1119", year: 2024, fuelType: "Petrol", transmission: "Automatic", seats: 5, pricePerDay: 12000, location: "Mumbai",
        images: ["/cars/bmw.jpg"],
        description: "Luxury BMW SUV", features: ["Leather"], status: "AVAILABLE"
      },
      {
        name: "Ertiga", brand: "Maruti", model: "ZXI", category: catMap['MUV'], registrationNumber: "MH31AB1120", year: 2023, fuelType: "CNG", transmission: "Manual", seats: 7, pricePerDay: 3200, location: "Wardha",
        images: ["/cars/ertiga.jpg"],
        description: "Family MUV CNG", features: ["CNG"], status: "AVAILABLE"
      },
      {
        name: "Verna", brand: "Hyundai", model: "SX Turbo", category: catMap['Sedan'], registrationNumber: "MH31AB1121", year: 2024, fuelType: "Petrol", transmission: "Automatic", seats: 5, pricePerDay: 3500, location: "Mumbai",
        images: ["/cars/verna.jpg"],
        description: "Turbo sedan ADAS", features: ["ADAS"], status: "AVAILABLE"
      },
      {
        name: "WagonR", brand: "Maruti", model: "ZXI", category: catMap['Hatchback'], registrationNumber: "MH31AB1122", year: 2023, fuelType: "Petrol", transmission: "Manual", seats: 5, pricePerDay: 1200, location: "Wardha",
        images: ["/cars/wagonr.jpg"],
        description: "Budget city car", features: ["AC"], status: "AVAILABLE"
      }
    ];

    await Vehicle.insertMany(vehicles);
    console.log('✅ 12 REAL CARS SEEDED - 100% LOCAL IMAGES');
    process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
};

seed();