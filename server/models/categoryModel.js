import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury', 'Electric']
  },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);