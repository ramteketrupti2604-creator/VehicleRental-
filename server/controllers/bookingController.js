import Booking from "../models/bookingModel.js";
import Vehicle from "../models/vehicleModel.js";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import { sendBookingEmail } from "../utils/sendEmail.js";

// Customer booking banata hai - Point 8 & 9
const createBooking = asyncHandler(async (req, res) => {
  const { vehicle, pickupDate, returnDate, pickupLocation, couponCode } = req.body;

  if (!vehicle ||!pickupDate ||!returnDate ||!pickupLocation) {
    res.status(400);
    throw new Error("All fields: vehicle, pickupDate, returnDate, pickupLocation required");
  }

  const pickup = new Date(pickupDate);
  const returnD = new Date(returnDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (pickup < today) {
    res.status(400);
    throw new Error("Pickup date cannot be in the past");
  }
  if (returnD <= pickup) {
    res.status(400);
    throw new Error("Return date must be after pickup date");
  }

  const vehicleDoc = await Vehicle.findById(vehicle);
  if (!vehicleDoc) {
    res.status(404);
    throw new Error("Vehicle not found");
  }
  if (vehicleDoc.status!== 'AVAILABLE') {
    res.status(400);
    throw new Error(`Vehicle is ${vehicleDoc.status}, cannot be booked`);
  }

  // Overlapping check - Assignment Point 8 main logic
  const overlapping = await Booking.findOne({
    vehicle: vehicle,
    status: { $in: ['PENDING', 'CONFIRMED'] },
    pickupDate: { $lt: returnD },
    returnDate: { $gt: pickup }
  });

  if (overlapping) {
    res.status(400);
    throw new Error(`Not available ${pickup.toDateString()} to ${returnD.toDateString()} - already booked from ${new Date(overlapping.pickupDate).toDateString()} to ${new Date(overlapping.returnDate).toDateString()}`);
  }

  // Backend price calculation - Point 9: Do not trust frontend price
  const rentalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24)) || 1;
  const price = vehicleDoc.pricePerDay;

  // Unique Booking Number - Point 10: VR-YYYYMMDD-XXXX
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await Booking.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
  });
  const bookingNumber = `VR-${dateStr}-${String(countToday + 1).padStart(4, '0')}`;

  // COUPON LOGIC - if provided
  let discount = 0;
  let finalAmount = rentalDays * price;

  if (couponCode) {
    // You can add coupon model check here if you have it
  }

  const booking = await Booking.create({
    bookingNumber,
    user: req.user._id,
    vehicle,
    pickupDate: pickup,
    returnDate: returnD,
    rentalDays,
    pricePerDay: price,
    totalAmount: finalAmount - discount,
    originalAmount: rentalDays * price,
    discount: discount,
    couponCode: couponCode || null,
    pickupLocation,
    status: "CONFIRMED",
    paymentStatus: "PENDING"
  });

  const pop = await Booking.findById(booking._id)
  .populate("vehicle", "name brand model pricePerDay images location")
  .populate("user", "name email phone");

  // BONUS EMAIL - Booking ke baad email bhejo (Non-blocking)
  // Isko await kiya hai par fail hone par bhi booking success hogi
  sendBookingEmail({
    to: pop.user.email,
    bookingNumber: pop.bookingNumber,
    vehicleName: `${pop.vehicle.brand} ${pop.vehicle.model} ${pop.vehicle.name}`,
    pickupDate: new Date(pop.pickupDate).toDateString(),
    returnDate: new Date(pop.returnDate).toDateString(),
    totalAmount: pop.totalAmount
  }).then(sent => {
    if(sent) console.log(`✅ Email sent to ${pop.user.email}`);
    else console.log(`⚠️ Email failed but booking ${pop.bookingNumber} is confirmed`);
  });

  res.status(201).json(pop);
});

const getMyBookings = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status.toUpperCase();
  const bookings = await Booking.find(filter)
  .populate("vehicle", "name brand model pricePerDay images registrationNumber location")
  .sort({ createdAt: -1 });
  res.json(bookings);
});

const getAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status.toUpperCase();

  const bookings = await Booking.find(filter)
  .populate("vehicle", "name brand model pricePerDay registrationNumber")
  .populate("user", "name email phone")
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  const total = await Booking.countDocuments(filter);
  res.json({ bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
  .populate("vehicle", "name brand model pricePerDay images location fuelType seats")
  .populate("user", "name email phone");
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (booking.user._id.toString()!== req.user._id.toString() && req.user.role!== 'admin') {
    res.status(403);
    throw new Error("Not authorized");
  }
  res.json(booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (booking.user.toString()!== req.user._id.toString() && req.user.role!== 'admin') {
    res.status(403);
    throw new Error("Not authorized");
  }

  const hoursLeft = (new Date(booking.pickupDate) - new Date()) / (1000 * 60 * 60);
  if (req.user.role!== 'admin' && hoursLeft < 24) {
    res.status(400);
    throw new Error("Cannot cancel within 24 hours of pickup - Point 11 rule. Book with future date (3 days later) to test cancel");
  }

  booking.status = 'CANCELLED';
  await booking.save();
  res.json({ message: "Booking cancelled successfully", booking });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error("Invalid status - must be PENDING/CONFIRMED/COMPLETED/CANCELLED");
  }
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  booking.status = status;
  if (status === 'COMPLETED') booking.paymentStatus = 'PAID';
  await booking.save();
  const updated = await Booking.findById(booking._id)
  .populate("vehicle", "name brand")
  .populate("user", "name email");
  res.json(updated);
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalVehicles = await Vehicle.countDocuments();
  const availableVehicles = await Vehicle.countDocuments({ status: 'AVAILABLE' });
  const activeBookings = await Booking.countDocuments({ status: { $in: ['PENDING', 'CONFIRMED'] } });
  const totalCustomers = await User.countDocuments({ role: 'user' });

  const revenueAgg = await Booking.aggregate([
    { $match: { status: { $ne: 'CANCELLED' } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  const recentBookings = await Booking.find({})
  .populate("user", "name email")
  .populate("vehicle", "name brand model")
  .sort({ createdAt: -1 })
  .limit(5);

  res.json({
    totalVehicles,
    availableVehicles,
    activeBookings,
    totalCustomers,
    totalRevenue,
    recentBookings
  });
});

export { createBooking, getMyBookings, getAllBookings, getBookingById, cancelBooking, updateBookingStatus, getDashboardStats };