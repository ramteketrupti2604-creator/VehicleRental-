import Vehicle from "../models/vehicleModel.js";
import User from "../models/userModel.js";
import Booking from "../models/bookingModel.js";
import asyncHandler from "express-async-handler";

const getDashboard = asyncHandler(async (req, res) => {
  const totalVehicles = await Vehicle.countDocuments();
  const availableVehicles = await Vehicle.countDocuments({ status: 'AVAILABLE' });
  const activeBookings = await Booking.countDocuments({ status: { $in: ['PENDING', 'CONFIRMED'] } });
  const totalCustomers = await User.countDocuments({ role: 'user' });

  const revenueData = await Booking.aggregate([
    { $match: { status: { $ne: 'CANCELLED' } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
  ]);
  const totalRevenue = revenueData[0]?.total || 0;

  // FINAL FIX - customer name + vehicle name 100% ayega
  const recentBookings = await Booking.find({})
  .populate({ path: 'user', select: 'name email phone' })
  .populate({ path: 'vehicle', select: 'name brand model registrationNumber' })
  .sort({ createdAt: -1 })
  .limit(5)
  .lean();

  res.json({
    totalVehicles,
    availableVehicles,
    activeBookings,
    totalCustomers,
    totalRevenue,
    recentBookings
  });
});

const getCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ role: 'user' }).select('-password');
  const customersWithCount = await Promise.all(
    customers.map(async (cust) => {
      const count = await Booking.countDocuments({ user: cust._id });
      return {
        _id: cust._id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        bookings: count,
        createdAt: cust.createdAt,
        status: 'Active'
      };
    })
  );
  res.json(customersWithCount);
});

export { getDashboard, getCustomers };