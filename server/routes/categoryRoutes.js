import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Category from '../models/categoryModel.js';
import Vehicle from '../models/vehicleModel.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});


router.post('/', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name required' });

    const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) return res.status(400).json({ message: `"${name}" already exists` });

    const category = await Category.create({ name: name.trim() });
    res.status(201).json(category);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});


router.put('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});


router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    
    const count1 = await Vehicle.countDocuments({ category: category.name });
    const count2 = await Vehicle.countDocuments({ category: category._id });
    const totalLinked = count1 + count2;

    if (totalLinked > 0) {
      return res.status(400).json({ message: `Cannot delete - ${totalLinked} vehicles use "${category.name}". Move them first.` });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;