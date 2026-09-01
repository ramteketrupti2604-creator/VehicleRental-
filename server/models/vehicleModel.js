import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true }, 
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  year: { type: Number, required: true },
  fuelType: { type: String, required: true, enum: ['Petrol', 'Diesel', 'Electric', 'CNG'] },
  transmission: { type: String, required: true, enum: ['Manual', 'Automatic'] },
  seats: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String },
  features: [{ type: String }],
  status: {
    type: String,
    enum: ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'], 
    default: 'AVAILABLE'
  }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);