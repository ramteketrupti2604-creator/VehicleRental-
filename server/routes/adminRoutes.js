import express from 'express';
import Vehicle from '../models/vehicleModel.js';
import Booking from '../models/bookingModel.js';
import User from '../models/userModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware - saare routes admin ke liye protected
router.use(protect, admin);

// ================== DASHBOARD STATS ==================
// Assignment Point 12: Total Vehicles, Available, Active Bookings, Customers, Revenue + Recent Bookings
const getDashboardStats = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'AVAILABLE' });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['PENDING', 'CONFIRMED'] } });
    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });

    // Total Revenue - Cancelled ko exclude karke
    const revAgg = await Booking.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentBookings = await Booking.find({})
     .populate('vehicle', 'name brand model images pricePerDay')
     .populate('user', 'name email phone')
     .sort({ createdAt: -1 })
     .limit(6);

    res.json({
      totalVehicles,
      availableVehicles,
      activeBookings,
      totalCustomers,
      totalRevenue: revAgg[0]?.total || 0,
      recentBookings
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

// Dono routes same function pe point karenge - tera frontend /dashboard call kar raha tha
router.get('/stats', getDashboardStats);
router.get('/dashboard', getDashboardStats);

// ================== CUSTOMERS ==================
// Assignment Point 13: Name, Email, Phone, Number of bookings, Registration date, Account status
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'user',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          role: 1,
          isActive: 1,
          createdAt: 1,
          bookingCount: { $size: '$bookings' },
          totalSpent: { $sum: '$bookings.totalAmount' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(customers);
  } catch (error) {
    console.error('Customers Error:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

// ================== ALL BOOKINGS FOR ADMIN ==================
router.get('/bookings', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let filter = {};
    if (status && status!== 'ALL') filter.status = status;

    const bookings = await Booking.find(filter)
     .populate('vehicle', 'name brand model category')
     .populate('user', 'name email phone')
     .sort({ createdAt: -1 })
     .limit(limit * 1)
     .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// ================== REVENUE STATS (For Chart - Bonus) ==================
router.get('/revenue', async (req, res) => {
  try {
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(monthlyRevenue);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue stats' });
  }
});

export default router;