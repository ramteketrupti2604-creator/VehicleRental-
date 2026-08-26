import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// User login check - JWT verification
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Bearer hatao

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Support both decoded.id and decoded._id (different token generators)
      const userId = decoded.id || decoded._id;

      req.user = await User.findById(userId).select('-password');

      // FIX: Seeder ke baad purana token invalid ho jata hai, user DB me nahi milega
      if (!req.user) {
        return res.status(401).json({ message: 'User not found, please login again - seed changed' });
      }

      return next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      // TokenExpiredError, JsonWebTokenError sab yaha ayega
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired, please login again' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin check - Point 3 Authorization: User, Admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Not authorized as Admin - Admin access only' });
  }
};

export { protect, admin };