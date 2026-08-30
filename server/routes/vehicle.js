import express from 'express';
import Vehicle from '../models/vehicleModel.js';
const router = express.Router();

router.get('/', async (req,res) => {
  try {
    const { minPrice, maxPrice } = req.query;
    let vehicles = await Vehicle.find({}).populate('category','name');
    
    if(minPrice || maxPrice){
      const min = Number(minPrice) || 0;
      const max = Number(maxPrice) || 9999999;
      vehicles = vehicles.filter(v => {
        const p = Number(v.pricePerDay);
        return p >= min && p <= max;
      });
    }
    
    res.json({ vehicles, total: vehicles.length, totalPages: 1, currentPage: 1 });
  } catch(e){
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', async (req,res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('category');
  res.json(vehicle);
});

export default router;