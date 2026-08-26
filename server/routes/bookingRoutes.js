import express from 'express';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { sendBookingEmail } from '../utils/sendEmail.js';

const router = express.Router();

// ===== TEMP DEBUG - Clean karne ke liye =====
router.get('/all-debug', async (req, res) => {
  try {
    const bookings = await Booking.find({}).limit(30);
    res.json(bookings);
  } catch(e) { res.json({ error: e.message }); }
});

router.get('/clean-this-car/:vehicleId', async (req, res) => {
  try {
    const result = await Booking.deleteMany({ vehicle: req.params.vehicleId });
    res.json({ message: `Clean ho gaya! ${result.deletedCount} bookings deleted` });
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// ===== CHECK AVAILABILITY =====
router.post('/check-availability', auth, async (req, res) => {
  try {
    const { vehicleId, pickupDate, returnDate, startDate, endDate } = req.body;
    const sDate = pickupDate || startDate;
    const eDate = returnDate || endDate;
    
    if (!vehicleId || !sDate || !eDate) {
      return res.status(400).json({ message: "Dates required" });
    }
    
    const pickup = new Date(sDate);
    const returnD = new Date(eDate);
    
    const vehicle = await Vehicle.findById(vehicleId);
    if(!vehicle) return res.status(400).json({ available: false, message: "Vehicle not found" });

    const overlapping = await Booking.findOne({
      vehicle: vehicleId,
      status: { $nin: ['cancelled', 'CANCELLED'] },
      $or: [
        { startDate: { $lt: returnD }, endDate: { $gt: pickup } },
        { pickupDate: { $lt: returnD }, returnDate: { $gt: pickup } }
      ]
    });

    if (overlapping) {
      return res.json({ available: false, message: `Not Available ${pickup.toDateString()} to ${returnD.toDateString()}` });
    }

    const days = Math.ceil((returnD - pickup) / (1000*60*60*24)) || 1;
    res.json({ available: true, rentalDays: days, pricePerDay: vehicle.pricePerDay, totalAmount: days * vehicle.pricePerDay });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== BOOKED DATES - CALENDAR RED =====
const bookedDatesHandler = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId || req.params.id;
    const bookings = await Booking.find({ vehicle: vehicleId, status: { $nin: ['cancelled', 'CANCELLED'] } });
    let arr = [];
    bookings.forEach(b => {
      const sRaw = b.startDate || b.pickupDate;
      const eRaw = b.endDate || b.returnDate;
      if(!sRaw || !eRaw) return;
      let cur = new Date(sRaw); cur.setHours(0,0,0,0);
      let end = new Date(eRaw); end.setHours(0,0,0,0);
      while(cur <= end){ arr.push(new Date(cur)); cur.setDate(cur.getDate()+1); }
    });
    res.json({ bookedDates: arr, count: arr.length });
  } catch(e){ res.status(500).json({ message: e.message }); }
};

router.get('/vehicle/:vehicleId/booked-dates', bookedDatesHandler);
router.get('/:vehicleId/booked-dates', bookedDatesHandler);

// ===== CREATE BOOKING - TUMHARA EMAIL WALA CODE =====
router.post('/', auth, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, pickupDate, returnDate } = req.body;
    const sDate = startDate || pickupDate;
    const eDate = endDate || returnDate;

    const vehicle = await Vehicle.findById(vehicleId);
    if(!vehicle) {
      return res.status(400).json({ message: 'Vehicle not available' });
    }

    const days = Math.ceil((new Date(eDate) - new Date(sDate)) / (1000*60*60*24)) + 1;
    const totalPrice = days * vehicle.pricePerDay;

    const booking = new Booking({
      user: req.user.id,
      vehicle: vehicleId,
      startDate: sDate,
      endDate: eDate,
      pickupDate: sDate,
      returnDate: eDate,
      totalPrice,
      totalAmount: totalPrice,
      status: 'confirmed'
    });

    await booking.save();

    try {
      const user = await User.findById(req.user.id);
      console.log("User email found:", user.email);
      await sendBookingEmail({
        to: user.email,
        bookingNumber: booking._id,
        vehicleName: vehicle.name || `${vehicle.brand} ${vehicle.model}`,
        pickupDate: sDate,
        returnDate: eDate,
        totalAmount: totalPrice
      });
    } catch (emailErr) {
      console.log("Booking ho gayi par email fail:", emailErr.message);
    }

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', auth, async (req,res)=>{
  const bookings = await Booking.find({ user: req.user.id }).populate('vehicle');
  res.json(bookings);
});

router.get('/:id', auth, async (req,res)=>{
  // Agar id booked-dates nahi hai to hi booking fetch karo
  if(req.params.id.includes('booked-dates')) return;
  const booking = await Booking.findById(req.params.id).populate('vehicle');
  res.json(booking);
});

export default router;