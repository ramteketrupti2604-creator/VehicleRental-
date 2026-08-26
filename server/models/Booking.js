import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingNumber: {  // <-- YE ADD KIYA
    type: String,
    required: true,
    unique: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  startDate: { type: Date, required: true }, // pickupDate
  endDate: { type: Date, required: true },   // returnDate
  totalDays: { type: Number, required: true },
  pricePerDay: { type: Number, required: true }, // <-- YE ADD KIYA
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING'
  },
  pickupLocation: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);