const router = require('express').Router();
const Vehicle = require('../models/Vehicle');
const {protect, admin} = require('../middleware/auth');

router.get('/', async (req,res) => {
  const vehicles = await Vehicle.find({status: 'AVAILABLE'}).populate('category');
  res.json({vehicles, total: vehicles.length, pages: 1});
});

router.get('/:id', async (req,res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('category');
  res.json(vehicle);
});

module.exports = router; // <-- ye line important hai