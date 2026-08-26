import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  rentalDays: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING','CONFIRMED','CANCELLED','COMPLETED'], default: 'CONFIRMED' },
  paymentStatus: { type: String, enum: ['PENDING','NOT_APPLICABLE'], default: 'NOT_APPLICABLE' },
  
  // ✅ NEW FIELDS - Coupon ke liye
  pickupLocation: { type: String },
  couponCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },
  originalAmount: { type: Number } // discount se pehle ka amount store karne ke liye

}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);