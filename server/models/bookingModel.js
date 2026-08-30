import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  rentalDays: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  totalDays: { type: Number },
  totalPrice: { type: Number },
  originalAmount: { type: Number },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  pickupLocation: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED'],
    default: 'CONFIRMED'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'NOT_APPLICABLE', 'FAILED'],
    default: 'PENDING'
  },
  isRescheduled: { type: Boolean, default: false },
  rescheduledAt: { type: Date },
  previousPickupDate: { type: Date },
  previousReturnDate: { type: Date },
  discountAmount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);