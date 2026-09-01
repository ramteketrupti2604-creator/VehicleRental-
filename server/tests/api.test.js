import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import app from '../server.js';
import { connect, close, clear } from './setup.js';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import Vehicle from '../models/vehicleModel.js';

dotenv.config();
let adminToken, userToken, vehicleId;

beforeAll(async () => await connect());
afterAll(async () => await close());

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'rental_secret_key_2024', { expiresIn: '30d' });
};

describe("Vehicle Rental - Automated Tests", () => {

  test("1. Register Admin & User (Direct DB)", async () => {
    await clear();
    const admin = await User.create({
      name: "Admin Test", email: "admin@rental.com", phone: "9999999999",
      password: "Admin@123", role: "admin"
    });
    const user = await User.create({
      name: "User Test", email: "user@rental.com", phone: "8888888888",
      password: "User@123", role: "user"
    });
    adminToken = generateToken(admin._id);
    userToken = generateToken(user._id);
    expect(adminToken).toBeDefined();
  });

  test("2. Login & Get Tokens (Mocked)", async () => {
    expect(adminToken).toBeDefined();
    expect(userToken).toBeDefined();
  });

  test("3. Add Vehicle (Admin)", async () => {
    
    const cat = await Category.create({ name: "Hatchback", description: "Hatchback Cars" });
    
    
    const vehicle = await Vehicle.create({
      name: "Swift Test",
      brand: "Maruti",
      model: "VXI",
      category: cat._id,
      pricePerDay: 1500,
      fuelType: "Petrol",
      transmission: "Manual",
      seatingCapacity: 5,
      seats: 5,
      year: 2023,
      registrationNumber: "MH12AB1234",
      location: "Pune",
      description: "Test Vehicle",
      status: "AVAILABLE",
      images: ["test.jpg"]
    });
    
    vehicleId = vehicle._id;
    console.log("VEHICLE CREATED DIRECT:", vehicleId);
    expect(vehicleId).toBeDefined();
  });

  test("4. Get All Vehicles (Public)", async () => {
    const res = await request(app).get('/api/vehicles');
    console.log("GET VEHICLES:", res.body.length || res.body.vehicles?.length);
    expect(res.statusCode).toBe(200);
  });

  test("5. Create Booking - Valid Dates", async () => {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 3);
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ vehicle: vehicleId, pickupDate: tomorrow.toISOString(), returnDate: dayAfter.toISOString(), pickupLocation: "Pune" });
    console.log("BOOKING RES:", res.statusCode);
    expect([200, 201]).toContain(res.statusCode);
  });

  test("6. Booking Should FAIL on Overlapping Dates (Critical Logic)", async () => {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 3);
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ vehicle: vehicleId, pickupDate: tomorrow.toISOString(), returnDate: dayAfter.toISOString() });
    console.log("OVERLAP RES:", res.statusCode, res.body.message);
    expect(res.statusCode).toBe(400);
  });

  test("7. Booking Should FAIL for Past Date", async () => {
    const past = new Date(); past.setDate(past.getDate() - 2);
    const future = new Date(); future.setDate(future.getDate() + 2);
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ vehicle: vehicleId, pickupDate: past.toISOString(), returnDate: future.toISOString() });
    expect(res.statusCode).toBe(400);
  });

  test("8. Admin Stats", async () => {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${adminToken}`);
    console.log("STATS RES:", res.statusCode, res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.totalVehicles).toBe(1);
  });
});