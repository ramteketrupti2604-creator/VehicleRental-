import Vehicle from '../models/vehicleModel.js';
import Category from '../models/categoryModel.js';
import Booking from '../models/bookingModel.js';

export const getVehicles = async (req, res) => {
  try {
    const {
      search, location, category, fuelType, transmission,
      minPrice, maxPrice, sort, page = 1, limit = 50
    } = req.query;

    let filter = {};

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { brand: regex }, { model: regex }];
    }
    if (location) {
      filter.location = { $regex: location.trim(), $options: 'i' };
    }
    if (category && category!== 'All' && category!== '') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({ name: { $regex: `^${category}$`, $options: 'i' } });
        if (catDoc) filter.category = catDoc._id;
      }
    }
    if (fuelType) {
      filter.fuelType = { $regex: `^${fuelType}$`, $options: 'i' };
    }
    if (transmission) {
      filter.transmission = { $regex: `^${transmission}$`, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_low' || sort === 'priceLowHigh') sortOption = { pricePerDay: 1 };
    if (sort === 'price_high' || sort === 'priceHighLow') sortOption = { pricePerDay: -1 };
    if (sort === 'latest' || sort === 'newest') sortOption = { createdAt: -1 };

    // Pehle bina price ke saare vehicles nikalo
    let vehicles = await Vehicle.find(filter)
      .populate('category', 'name')
      .sort(sortOption);

    // AB JS ME PRICE FILTER - 100% kaam karega
    if (minPrice!== '' && minPrice!== undefined || maxPrice!== '' && maxPrice!== undefined) {
      const min = minPrice!== '' && minPrice!== undefined ? Number(minPrice) : 0;
      const max = maxPrice!== '' && maxPrice!== undefined ? Number(maxPrice) : 9999999;
      
      vehicles = vehicles.filter(v => {
        const price = Number(v.pricePerDay);
        return price >= min && price <= max;
      });
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 50);
    const skip = (pageNum - 1) * limitNum;

    const total = vehicles.length;
    const paginatedVehicles = vehicles.slice(skip, skip + limitNum);

    console.log(`PRICE FILTER ${minPrice}-${maxPrice} => Found ${total} cars`);

    res.json({
      vehicles: paginatedVehicles,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id).populate('category', 'name');
    if (!v) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(v);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    const populated = await vehicle.populate('category', 'name');
    res.status(201).json(populated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category', 'name');
    if (!vehicle) return res.status(404).json({ message: 'Not found' });
    res.json(vehicle);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const v = await Vehicle.findByIdAndDelete(req.params.id);
    if (!v) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['AVAILABLE','UNAVAILABLE','MAINTENANCE'].includes(status.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { status: status.toUpperCase() }, { new: true }).populate('category', 'name');
    if (!vehicle) return res.status(404).json({ message: 'Not found' });
    res.json(vehicle);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getAdminVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}).populate('category', 'name').sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { vehicleId, pickupDate, returnDate } = req.query;
    if(!vehicleId ||!pickupDate ||!returnDate) return res.json({ available: true, message: 'Dates missing' });
    const pickup = new Date(pickupDate);
    const ret = new Date(returnDate);
    if (pickup >= ret) {
      return res.json({ available: false, message: 'Return date must be after pickup' });
    }
    const overlapping = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ['PENDING','CONFIRMED', 'pending', 'confirmed'] },
      pickupDate: { $lt: ret },
      returnDate: { $gt: pickup }
    });
    res.json({
      available:!overlapping,
      overlappingBooking: overlapping? overlapping.bookingNumber : null,
      message: overlapping? 'Vehicle already booked for selected dates' : 'Available'
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({ available: false, message: e.message });
  }
};