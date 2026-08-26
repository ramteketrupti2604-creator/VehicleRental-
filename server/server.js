import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import Coupon from './models/couponModel.js';

import { protect, admin } from './middleware/authMiddleware.js';
import Booking from "./models/bookingModel.js";
import Vehicle from "./models/vehicleModel.js";
import User from "./models/userModel.js";
import { sendBookingEmail } from './utils/sendEmail.js'; // <-- EMAIL KE LIYE ADD KIYA

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const statsLogic = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'AVAILABLE' });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['PENDING', 'CONFIRMED'] } });
    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });
    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const recentBookings = await Booking.find({})
    .populate('vehicle', 'name brand model')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(6);
    res.json({
      totalVehicles,
      availableVehicles,
      activeBookings,
      totalCustomers,
      totalRevenue: revenueAgg[0]?.total || 0,
      recentBookings
    });
  } catch(e){
    console.error(e);
    res.status(500).json({ message: e.message })
  }
};

app.get('/api/admin/stats', protect, admin, statsLogic);
app.get('/api/admin/dashboard', protect, admin, statsLogic);
app.get('/api/dashboard-stats', protect, admin, statsLogic);

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);

app.post('/api/bookings', protect, async (req,res) => {
  try {
    const { vehicle, pickupDate, returnDate, pickupLocation, couponCode } = req.body;
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const today = new Date(); today.setHours(0,0,0,0);
    if (!pickupDate ||!returnDate) return res.status(400).json({ message: "Pickup and Return dates required" });
    if (pickup < today) return res.status(400).json({ message: "Pickup date cannot be in the past" });
    if (returnD <= pickup) return res.status(400).json({ message: "Return date must be after pickup date" });
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) return res.status(404).json({ message: "Vehicle not found" });
    if (vehicleDoc.status!== 'AVAILABLE') return res.status(400).json({ message: "Vehicle not available for booking" });
    const overlapping = await Booking.findOne({
      vehicle,
      status: { $in: ['PENDING','CONFIRMED'] },
      pickupDate: { $lt: returnD },
      returnDate: { $gt: pickup }
    });
    if (overlapping) return res.status(400).json({ message: `Vehicle already booked from ${overlapping.pickupDate.toDateString()} to ${overlapping.returnDate.toDateString()}` });
    const days = Math.ceil((returnD - pickup)/(1000*60*60*24)) || 1;
    let total = days * vehicleDoc.pricePerDay;
    let discount = 0;
    let appliedCoupon = null;
    if(couponCode){
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if(!coupon) return res.status(400).json({ message: "Invalid coupon code" });
      if(new Date() > coupon.expiryDate) return res.status(400).json({ message: "Coupon expired" });
      if(coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: "Coupon limit reached" });
      if(total < coupon.minAmount) return res.status(400).json({ message: `Min amount ₹${coupon.minAmount} required for this coupon` });
      discount = coupon.discountType === 'PERCENT'? (total * coupon.discountValue / 100) : coupon.discountValue;
      if(coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      total = total - discount;
      appliedCoupon = coupon.code;
      coupon.usedCount += 1;
      await coupon.save();
    }
    const booking = await Booking.create({
      bookingNumber: `VR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000+Math.random()*9000)}`,
      vehicle,
      user: req.user._id,
      pickupDate: pickup,
      returnDate: returnD,
      rentalDays: days,
      totalAmount: total,
      pricePerDay: vehicleDoc.pricePerDay,
      pickupLocation: pickupLocation || vehicleDoc.location,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
      couponCode: appliedCoupon,
      discountAmount: discount
    });
    const populated = await Booking.findById(booking._id).populate('vehicle').populate('user','name email');
    
    // --- EMAIL BHEJNE KA CODE - YAHI MAIN FIX HAI ---
    try {
      console.log("Trying to send email to:", populated.user.email);
      await sendBookingEmail({
        to: populated.user.email,
        bookingNumber: populated.bookingNumber,
        vehicleName: populated.vehicle.name,
        pickupDate: populated.pickupDate.toDateString(),
        returnDate: populated.returnDate.toDateString(),
        totalAmount: populated.totalAmount
      });
    } catch (emailErr) {
      console.log("Booking ho gayi par email fail:", emailErr.message);
    }

    res.status(201).json(populated);
  } catch(e){
    console.error(e);
    res.status(400).json({ message: e.message })
  }
});

app.get('/api/bookings/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("vehicle").sort({ createdAt: -1 });
    res.json({ bookings });
  } catch(e){ res.status(500).json({ message: e.message }) }
});
app.get('/api/bookings/mybookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("vehicle").sort({ createdAt: -1 });
    res.json(bookings);
  } catch(e){ res.status(500).json({ message: e.message }) }
});
app.get('/api/bookings/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("vehicle").sort({ createdAt: -1 });
    res.json({ bookings });
  } catch(e){ res.status(500).json({ message: e.message }) }
});
app.get('/api/bookings', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate("vehicle").populate("user","name email phone").sort({ createdAt: -1 });
    res.json(bookings);
  } catch(e){ res.status(500).json({ message: e.message }) }
});
app.get('/api/bookings/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("vehicle").populate("user","name email phone");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (req.user.role!== 'admin' && booking.user._id.toString()!== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(booking);
  } catch(e){ res.status(500).json({ message: e.message }) }
});
app.put('/api/bookings/:id/cancel', protect, async (req,res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (req.user.role!== 'admin' && booking.user.toString()!== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }
    if (booking.status === 'CANCELLED') return res.status(400).json({ message: "Already cancelled" });
    if (booking.status === 'COMPLETED') return res.status(400).json({ message: "Cannot cancel completed booking" });
    const hoursLeft = (new Date(booking.pickupDate) - new Date()) / (1000 * 60 * 60);
    if (hoursLeft < 24 && req.user.role!== 'admin') {
      return res.status(400).json({ message: "Cannot cancel within 24 hours of pickup date" });
    }
    booking.status = 'CANCELLED';
    await booking.save();
    res.json({ message: "Booking cancelled successfully", booking });
  } catch(e){ res.status(500).json({ message: e.message }) }
});
app.put('/api/bookings/:id/status', protect, admin, async (req,res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    .populate('vehicle').populate('user','name email');
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch(e){ res.status(500).json({ message: e.message }) }
});

app.get('/', (req, res) => res.send('Vehicle Rental API Running... ✅ FINAL FIXED + COUPON'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB Connected ✅');
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} - FINAL FIXED + COUPON + EMAIL ✅`));
}).catch(err => { console.log(err); process.exit(1); });