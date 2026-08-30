import express from 'express';
import Vehicle from '../models/vehicleModel.js';
import Category from '../models/categoryModel.js';
import Booking from '../models/bookingModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../utils/cloudinary.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// Cloudinary upload helper
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'vehicle-rental', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// ========== GET ALL VEHICLES ==========
router.get('/', async (req, res) => {
  try {
    const { search, location, category, fuelType, transmission, minPrice, maxPrice, sort, page = 1, limit = 50 } = req.query;
    let filter = {};
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { brand: regex }, { model: regex }];
    }
    if (location) filter.location = { $regex: location.trim(), $options: 'i' };
    if (category && category!== 'All' && category!== '') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) filter.category = category;
      else {
        const catDoc = await Category.findOne({ name: { $regex: `^${category}$`, $options: 'i' } });
        if (catDoc) filter.category = catDoc._id;
      }
    }
    if (fuelType) filter.fuelType = { $regex: `^${fuelType}$`, $options: 'i' };
    if (transmission) filter.transmission = { $regex: `^${transmission}$`, $options: 'i' };
    let sortOption = { createdAt: -1 };
    if (sort === 'price_low' || sort === 'priceLowHigh') sortOption = { pricePerDay: 1 };
    if (sort === 'price_high' || sort === 'priceHighLow') sortOption = { pricePerDay: -1 };
    let vehicles = await Vehicle.find(filter).populate('category', 'name').sort(sortOption);
    if (minPrice || maxPrice) {
      const min = minPrice? Number(minPrice) : 0;
      const max = maxPrice? Number(maxPrice) : 9999999;
      vehicles = vehicles.filter(v => Number(v.pricePerDay) >= min && Number(v.pricePerDay) <= max);
    }
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 50);
    const skip = (pageNum - 1) * limitNum;
    const total = vehicles.length;
    const paginated = vehicles.slice(skip, skip + limitNum);
    res.json({ vehicles: paginated, total, page: pageNum, totalPages: Math.ceil(total / limitNum) || 1, currentPage: pageNum });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ========== CHECK AVAILABILITY ==========
router.get('/check-availability', async (req, res) => {
  try {
    const { vehicleId, pickupDate, returnDate } = req.query;
    if(!vehicleId ||!pickupDate ||!returnDate) return res.json({ available: true });
    const pickup = new Date(pickupDate); const ret = new Date(returnDate);
    if (pickup >= ret) return res.json({ available: false, message: 'Return date must be after pickup' });
    const overlapping = await Booking.findOne({ vehicle: vehicleId, status: { $in: ['PENDING','CONFIRMED'] }, pickupDate: { $lt: ret }, returnDate: { $gt: pickup } });
    res.json({ available:!overlapping, message: overlapping? 'Vehicle already booked' : 'Available' });
  } catch(e) { res.status(500).json({ message: e.message }) }
});

// ========== ADMIN GET ALL ==========
router.get('/admin/all', protect, admin, async (req, res) => {
  try { const vehicles = await Vehicle.find({}).populate('category', 'name').sort({ createdAt: -1 }); res.json(vehicles); }
  catch (e) { res.status(500).json({ message: e.message }) }
});

// ========== GET BY ID ==========
router.get('/:id', async (req, res) => {
  try { const v = await Vehicle.findById(req.params.id).populate('category', 'name'); if (!v) return res.status(404).json({ message: 'Vehicle not found' }); res.json(v); }
  catch (e) { res.status(500).json({ message: e.message }) }
});

// ========== ADD VEHICLE ==========
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    let data = {...req.body };
    if (data.category &&!data.category.match(/^[0-9a-fA-F]{24}$/)) {
      const catDoc = await Category.findOne({ name: { $regex: `^${data.category}$`, $options: 'i' } });
      if (catDoc) data.category = catDoc._id;
      else { const firstCat = await Category.findOne(); if(firstCat) data.category = firstCat._id; }
    }
    if (data.pricePerDay) data.pricePerDay = Number(data.pricePerDay);
    if (data.price) data.pricePerDay = Number(data.price);
    if (data.year) data.year = Number(data.year);
    if (data.seats) data.seats = Number(data.seats);
    if (!data.brand) data.brand = data.name? data.name.split(' ')[0] : 'Maruti';
    if (!data.model) data.model = data.name? data.name.split(' ').slice(1).join(' ') || data.name : 'Base';
    if (!data.name) data.name = `${data.brand} ${data.model}`;
    if (!data.registrationNumber || data.registrationNumber.trim() === '') {
      data.registrationNumber = 'MH' + Math.floor(10 + Math.random()*90) + 'AB' + Math.floor(1000+Math.random()*9000);
    }
    data.registrationNumber = data.registrationNumber.toUpperCase().replace(/\s/g,'');
    if (data.features) { try { data.features = JSON.parse(data.features); } catch { data.features = data.features.split(',').map(f=>f.trim()).filter(Boolean); } }

    if (req.file) {
      try {
        console.log("Uploading to Cloudinary with cloud:", process.env.CLOUDINARY_CLOUD_NAME);
        const result = await uploadToCloudinary(req.file.buffer);
        console.log("Cloudinary OK:", result.secure_url);
        data.images = [result.secure_url];
      } catch (cloudErr) {
        console.error("Cloudinary FAILED, using placeholder:", cloudErr.message);
        data.images = ['https://via.placeholder.com/400x300?text=No+Image'];
      }
    } else {
      data.images = ['https://via.placeholder.com/400x300?text=No+Image'];
    }

    if (!data.status) data.status = 'AVAILABLE';
    if (!data.location) data.location = 'Pune';

    const vehicle = await Vehicle.create(data);
    const populated = await vehicle.populate('category', 'name');
    res.status(201).json(populated);
  } catch (e) {
    console.error("ADD ERROR:", e);
    if (e.code === 11000) return res.status(400).json({ message: `Duplicate registration: ${e.keyValue.registrationNumber}` });
    res.status(400).json({ message: e.message });
  }
});

// ========== UPDATE VEHICLE ==========
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    let updateData = {...req.body };
    if (updateData.category &&!updateData.category.match(/^[0-9a-fA-F]{24}$/)) {
      const catDoc = await Category.findOne({ name: { $regex: `^${updateData.category}$`, $options: 'i' } });
      if (catDoc) updateData.category = catDoc._id;
    }
    if (updateData.price) updateData.pricePerDay = Number(updateData.price);
    if (updateData.pricePerDay) updateData.pricePerDay = Number(updateData.pricePerDay);
    if (updateData.year) updateData.year = Number(updateData.year);
    if (updateData.seats) updateData.seats = Number(updateData.seats);
    if (updateData.features) { try { updateData.features = JSON.parse(updateData.features); } catch { updateData.features = updateData.features.split(',').map(f=>f.trim()).filter(Boolean); } }
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        updateData.images = [result.secure_url];
      } catch (err) { console.log("Cloudinary update failed", err.message); }
    }
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('category', 'name');
    if (!vehicle) return res.status(404).json({ message: 'Not found' });
    res.json(vehicle);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ========== DELETE ==========
router.delete('/:id', protect, admin, async (req, res) => {
  try { const v = await Vehicle.findByIdAndDelete(req.params.id); if (!v) return res.status(404).json({ message: 'Not found' }); res.json({ message: 'Vehicle deleted successfully' }); }
  catch (e) { res.status(500).json({ message: e.message }) }
});

// ========== STATUS ==========
router.patch('/:id/status', protect, admin, async (req, res) => {
  try { const { status } = req.body; const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { status: status.toUpperCase() }, { new: true }).populate('category', 'name'); res.json(vehicle); }
  catch (e) { res.status(500).json({ message: e.message }) }
});

export default router;