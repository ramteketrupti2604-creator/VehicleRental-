import express from 'express';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { sendBookingEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.get('/all-debug', async (req, res) => {
  try { const bookings = await Booking.find({}).limit(30); res.json(bookings); }
  catch(e) { res.json({ error: e.message }); }
});

router.get('/clean-this-car/:vehicleId', async (req, res) => {
  try {
    const result = await Booking.deleteMany({ vehicle: req.params.vehicleId });
    const result2 = await Booking.deleteMany({});
    res.json({ message: `Clean ho gaya! ${result.deletedCount} + ${result2.deletedCount} bookings deleted. DB empty now` });
  } catch(e) { res.status(500).json({ message: e.message }); }
});

router.post('/check-availability', async (req, res) => {
  try {
    const { vehicleId, pickupDate, returnDate, startDate, endDate } = req.body;
    const sDate = pickupDate || startDate;
    const eDate = returnDate || endDate;

    const vehicle = await Vehicle.findById(vehicleId);
    if(!vehicle) return res.json({ available: false, message: "Vehicle not found" });

    const pickup = new Date(sDate);
    const returnD = new Date(eDate);

    const overlapping = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ['PENDING','CONFIRMED'] },
      pickupDate: { $lt: returnD },
      returnDate: { $gt: pickup }
    });

    if (overlapping) {
      return res.json({
        available: false,
        message: `Already booked from ${overlapping.pickupDate.toDateString()} to ${overlapping.returnDate.toDateString()}`
      });
    }

    const days = Math.ceil((returnD - pickup) / (1000*60*60*24)) + 1;
    const finalDays = days > 0? days : 1;

    return res.json({
      available: true,
      message: "Available",
      rentalDays: finalDays,
      pricePerDay: vehicle.pricePerDay,
      totalAmount: finalDays * vehicle.pricePerDay
    });
  } catch(err) {
    console.log(err);
    return res.json({ available: true, message: "Available (fallback)" });
  }
});

router.get('/check-availability', async (req, res) => {
  return res.json({ available: true, message: "Available" });
});

// ===== YAHI MAIN FIX HAI - PER VEHICLE CALENDAR =====
const bookedDatesHandler = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId || req.params.id;
    const bookings = await Booking.find({
      vehicle: vehicleId,
      status: { $in: ['CONFIRMED', 'PENDING'] }
    }).select('pickupDate returnDate');

    let allDates = [];
    bookings.forEach(b => {
      let curr = new Date(b.pickupDate);
      let end = new Date(b.returnDate);
      while(curr <= end) {
        allDates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
      }
    });

    // Sirf isi gaadi ki dates
    res.json({ bookedDates: allDates, count: allDates.length });
  } catch (err) {
    console.log(err);
    res.json({ bookedDates: [], count: 0 });
  }
};
router.get('/vehicle/:vehicleId/booked-dates', bookedDatesHandler);
router.get('/:vehicleId/booked-dates', bookedDatesHandler);
router.get('/:id/booked-dates', bookedDatesHandler);

router.post('/', auth, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, pickupDate, returnDate } = req.body;
    const sDate = startDate || pickupDate;
    const eDate = endDate || returnDate;
    const vehicle = await Vehicle.findById(vehicleId);
    if(!vehicle) return res.status(400).json({ message: 'Vehicle not available' });
    const days = Math.ceil((new Date(eDate) - new Date(sDate)) / (1000*60*60*24)) + 1;
    const totalPrice = days * vehicle.pricePerDay;
    const booking = new Booking({
      user: req.user.id, vehicle: vehicleId,
      startDate: sDate, endDate: eDate,
      pickupDate: sDate, returnDate: eDate,
      totalPrice, totalAmount: totalPrice, status: 'confirmed'
    });
    await booking.save();
    try {
      const user = await User.findById(req.user.id);
      await sendBookingEmail({
        to: user.email, bookingNumber: booking._id,
        vehicleName: vehicle.name || `${vehicle.brand} ${vehicle.model}`,
        pickupDate: sDate, returnDate: eDate, totalAmount: totalPrice
      });
    } catch (emailErr) { console.log("Email fail:", emailErr.message); }
    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    console.log(err); res.status(500).json({ message: err.message });
  }
});

router.get('/my', auth, async (req,res)=>{
  const bookings = await Booking.find({ user: req.user.id }).populate('vehicle');
  res.json(bookings);
});

router.get('/:id', auth, async (req,res)=>{
  if(req.params.id.includes('booked-dates') || req.params.id.includes('check-availability')) return res.json({});
  const booking = await Booking.findById(req.params.id).populate('vehicle');
  res.json(booking);
});

export default router;