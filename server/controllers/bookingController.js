import Booking from "../models/bookingModel.js";
import Vehicle from "../models/vehicleModel.js";
import User from "../models/userModel.js";
import Coupon from "../models/couponModel.js";
import asyncHandler from "express-async-handler";
import { sendBookingEmail } from "../utils/sendEmail.js";

// CREATE BOOKING
const createBooking = asyncHandler(async (req, res) => {
  const { vehicle, pickupDate, returnDate, pickupLocation, couponCode } = req.body;

  if (!vehicle || !pickupDate || !returnDate || !pickupLocation) {
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
  if (vehicleDoc.status !== 'AVAILABLE') {
    res.status(400);
    throw new Error(`Vehicle is ${vehicleDoc.status}, cannot be booked`);
  }

  const overlapping = await Booking.findOne({
    vehicle: vehicle,
    status: { $in: ['PENDING', 'CONFIRMED'] },
    pickupDate: { $lt: returnD },
    returnDate: { $gt: pickup }
  });

  if (overlapping) {
    res.status(400);
    throw new Error(`Not available ${pickup.toDateString()} to ${returnD.toDateString()}`);
  }

  const rentalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24)) || 1;
  const price = vehicleDoc.pricePerDay;

  let discount = 0;
  let couponData = null;
  if (couponCode) {
    couponData = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!couponData) {
      res.status(400);
      throw new Error("Invalid coupon code");
    }
    if (new Date(couponData.expiryDate) < new Date()) {
      res.status(400);
      throw new Error("Coupon expired");
    }
    if (couponData.discountType === 'FLAT') {
      discount = couponData.discountValue;
    } else if (couponData.discountType === 'PERCENT') {
      discount = (rentalDays * price * couponData.discountValue) / 100;
      if (couponData.maxDiscount) discount = Math.min(discount, couponData.maxDiscount);
    }
  }

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await Booking.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
  });
  const bookingNumber = `VR-${dateStr}-${String(countToday + 1).padStart(4, '0')}`;

  const booking = await Booking.create({
    bookingNumber,
    user: req.user._id,
    vehicle,
    pickupDate: pickup,
    returnDate: returnD,
    rentalDays,
    pricePerDay: price,
    totalAmount: (rentalDays * price) - discount,
    originalAmount: rentalDays * price,
    discount,
    couponCode: couponData ? couponData.code : null,
    pickupLocation,
    status: "CONFIRMED",
    paymentStatus: "PENDING"
  });

  if (couponData) {
    couponData.usedCount += 1;
    await couponData.save();
  }

  const pop = await Booking.findById(booking._id)
    .populate("vehicle", "name brand model pricePerDay images location")
    .populate("user", "name email phone");

  sendBookingEmail({
    to: pop.user.email,
    bookingNumber: pop.bookingNumber,
    vehicleName: `${pop.vehicle.brand} ${pop.vehicle.model}`,
    pickupDate: new Date(pop.pickupDate).toDateString(),
    returnDate: new Date(pop.returnDate).toDateString(),
    totalAmount: pop.totalAmount
  });

  res.status(201).json(pop);
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("vehicle", "name brand model pricePerDay images registrationNumber location")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("vehicle")
    .populate("user", "name email phone");
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error("Not authorized");
  }
  res.json(booking);
});

const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate("vehicle")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error("Not authorized to cancel this booking");
  }

  if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
    res.status(400);
    throw new Error(`Booking is already ${booking.status}`);
  }

  const now = new Date();
  const pickup = new Date(booking.pickupDate);
  const hoursLeft = (pickup - now) / (1000 * 60 * 60);

  if (hoursLeft < 24) {
    res.status(400);
    throw new Error("Cannot cancel within 24 hours of pickup time");
  }

  booking.status = 'CANCELLED';
  await booking.save();

  if (booking.couponCode) {
    const coupon = await Coupon.findOne({ code: booking.couponCode });
    if (coupon && coupon.usedCount > 0) {
      coupon.usedCount -= 1;
      await coupon.save();
    }
  }

  res.json({ message: "Booking cancelled successfully", booking });
});

// COMPLETE BOOKING - FINAL FIX FOR PAID ERROR
const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.status === 'COMPLETED') {
    res.status(400);
    throw new Error("Already completed");
  }

  booking.status = 'COMPLETED';
  booking.paymentStatus = 'PAID';
  await booking.save({ validateBeforeSave: false });

  res.json({ message: "Booking completed successfully", booking });
});

export { createBooking, getMyBookings, getAllBookings, getBookingById, cancelBooking, completeBooking };