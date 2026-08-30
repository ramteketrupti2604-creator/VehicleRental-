import express from 'express';
import { 
  authUser, 
  registerUser, 
  getUserProfile,
  updateUserProfile,
  getAllCustomers
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';

const router = express.Router();

// Public
router.post('/login', authUser);
router.post('/register', registerUser);

// Customer - Profile (IMPORTANT: /profile route /:id se upar hona chahiye)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, async (req, res) => {
  try {
    // agar tumhare controller me updateUserProfile nahi hai to ye fallback kaam karega
    if (typeof updateUserProfile === 'function') {
      return updateUserProfile(req, res);
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    
    // email update allow nahi karna
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin - Customers
router.get('/', protect, admin, getAllCustomers); // GET /api/users
router.get('/customers', protect, admin, getAllCustomers); // GET /api/users/customers alias

export default router;