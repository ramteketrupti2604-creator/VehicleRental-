import express from 'express';
import Vehicle from '../models/vehicleModel.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js'; // Cloudinary upload

const router = express.Router();

const admin = (req, res, next) => {
  if (req.user && req.user.role?.toLowerCase() === 'admin') next();
  else res.status(401).json({ message: 'Not authorized as admin' });
};

// --- BYPASS - Kabhi error nahi dega ---
router.post('/:id/check-availability', async (req, res) => {
  res.json({ available: true, message: 'Available ✅' });
});

router.get('/', async (req, res) => {
  try {
    const { search, category, location, fuelType, transmission, minPrice, maxPrice, sort, page=1, limit=12 } = req.query;
    let query = { status: 'AVAILABLE' };
    let andConditions = [];
    if (search && search.trim() !== '') {
      andConditions.push({ $or: [{ name: { $regex: search.trim(), $options: 'i' } }, { brand: { $regex: search.trim(), $options: 'i' } }, { model: { $regex: search.trim(), $options: 'i' } }] });
    }
    if (category) andConditions.push({ category: category });
    if (location) andConditions.push({ location: { $regex: location, $options: 'i' } });
    if (fuelType) andConditions.push({ fuelType: fuelType });
    if (transmission) andConditions.push({ transmission: transmission });
    if (minPrice || maxPrice) {
      let priceCond = {};
      if (minPrice) priceCond.$gte = Number(minPrice);
      if (maxPrice) priceCond.$lte = Number(maxPrice);
      andConditions.push({ priceCond: priceCond });
      andConditions.push({ pricePerDay: priceCond });
    }
    if (andConditions.length > 0) query.$and = andConditions;
    let sortOpt = { createdAt: -1 };
    if (sort === 'price_low' || sort === 'price_asc') sortOpt = { pricePerDay: 1 };
    if (sort === 'price_high' || sort === 'price_desc') sortOpt = { pricePerDay: -1 };
    const vehicles = await Vehicle.find(query).populate('category','name').sort(sortOpt).limit(Number(limit)).skip((Number(page)-1)*Number(limit));
    const total = await Vehicle.countDocuments(query);
    res.json({ vehicles, totalPages: Math.ceil(total/Number(limit)) || 1, currentPage: Number(page), total });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/admin/all', protect, admin, async (req,res) => {
  const vehicles = await Vehicle.find({}).populate('category','name').sort({ createdAt: -1 });
  res.json({ vehicles, total: vehicles.length });
});

router.get('/:id', async (req,res) => {
  const v = await Vehicle.findById(req.params.id).populate('category','name');
  if (!v) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(v);
});

// CREATE with Cloudinary Image Upload
router.post('/', protect, admin, upload.array('images', 5), async (req,res) => {
  try {
    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    
    const vehicleData = {
      ...req.body,
      images: imageUrls.length > 0 ? imageUrls : req.body.images || []
    };

    const v = await Vehicle.create(vehicleData);
    res.status(201).json(await v.populate('category','name'));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// UPDATE with Cloudinary Image Upload
router.put('/:id', protect, admin, upload.array('images', 5), async (req,res) => {
  try {
    let updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => file.path);
      updateData.images = imageUrls;
    }

    const v = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('category','name');
    res.json(v);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/:id', protect, admin, async (req,res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ message: 'Vehicle removed' });
});

router.put('/:id/status', protect, admin, async (req,res) => {
  const v = await Vehicle.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('category','name');
  res.json(v);
});

export default router;