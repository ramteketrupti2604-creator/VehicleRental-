import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  registrationNumber: { type: String, required: true, unique: true },
  year: { type: Number },
  fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric", "CNG"] },
  transmission: { type: String, enum: ["Manual", "Automatic"] },
  seats: { type: Number, default: 5 },
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String },
  features: [{ type: String }],
  images: [{ type: String }],
  status: { 
    type: String, 
    enum: ["AVAILABLE", "BOOKED", "MAINTENANCE"], 
    default: "AVAILABLE" 
  }
}, { timestamps: true });

// Overwrite error fix
const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;