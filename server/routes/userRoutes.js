import express from 'express';
import { 
  authUser, 
  registerUser, 
  getUserProfile,
  getAllCustomers
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.get('/profile', protect, getUserProfile);

// 🔥 YE 2 LINES ADD KI - ISSE TERA BUG FIX HOGA
router.get('/', protect, admin, getAllCustomers); // GET /api/users -> customers
router.get('/customers', protect, admin, getAllCustomers); // alias

export default router;