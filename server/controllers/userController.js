import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';
import generateToken from '../utils/generateToken.js';

// @desc Auth user & get token
// @route POST /api/users/login
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.role === 'admin',
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Register a new user
// @route POST /api/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password, phone });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get user profile
// @route GET /api/users/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 YEHI MISSING THA - Admin Customers - Point 14
// @desc Get all customers with stats
// @route GET /api/users
export const getAllCustomers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select("-password").sort({ createdAt: -1 });

    const customersWithStats = await Promise.all(users.map(async (u) => {
      const bookings = await Booking.find({ user: u._id });
      const totalBookings = bookings.length;
      const totalSpent = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || '-',
        role: u.role,
        createdAt: u.createdAt,
        totalBookings,
        totalSpent,
      };
    }));

    res.json(customersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};