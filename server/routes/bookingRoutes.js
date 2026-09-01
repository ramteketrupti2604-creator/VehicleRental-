import express from 'express';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import Coupon from '../models/Coupon.js';
import auth from '../middleware/auth.js';
import { sendBookingEmail } from '../utils/sendEmail.js';

const router = express.Router();


router.get('/all-debug', async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({createdAt: -1}).limit(30).populate('vehicle');
    res.json(bookings);
  } catch(e) { res.json({ error: e.message }); }
});


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
      status: { $in: ['PENDING','CONFIRMED'] },
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
    res.json({ bookedDates: arr });
  } catch(e){ res.status(500).json({ message: e.message }); }
};

router.get('/vehicle/:vehicleId/booked-dates', bookedDatesHandler);
router.get('/:vehicleId/booked-dates', bookedDatesHandler);


router.post('/', auth, async (req, res) => {
  try {
    const { vehicleId, vehicle, startDate, endDate, pickupDate, returnDate, pickupLocation, couponCode } = req.body;
    const vId = vehicleId || vehicle;
    const sDate = startDate || pickupDate;
    const eDate = endDate || returnDate;

    if(!vId || !sDate || !eDate){
      return res.status(400).json({ message: "vehicle, pickupDate, returnDate required" });
    }

    const vehicleDoc = await Vehicle.findById(vId);
    if(!vehicleDoc) return res.status(404).json({ message: 'Vehicle not found' });

    const pickup = new Date(sDate);
    const returnD = new Date(eDate);
    const days = Math.ceil((returnD - pickup) / (1000*60*60*24)) || 1;

    let discount = 0;
    let coupon = null;
    if(couponCode){
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if(coupon && new Date(coupon.expiryDate) > new Date()){
        if(coupon.discountType === 'FLAT') discount = coupon.discountValue;
        else if(coupon.discountType === 'PERCENT') discount = (days * vehicleDoc.pricePerDay * coupon.discountValue)/100;
        if(coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    const totalAmount = (days * vehicleDoc.pricePerDay) - discount;
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const count = await Booking.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } });
    const bookingNumber = `VR-${dateStr}-${String(count+1).padStart(4,'0')}`;

    const booking = new Booking({
      bookingNumber,
      user: req.user.id,
      vehicle: vId,
      startDate: sDate,
      endDate: eDate,
      pickupDate: sDate,
      returnDate: eDate,
      rentalDays: days,
      pricePerDay: vehicleDoc.pricePerDay,
      totalAmount: totalAmount > 0 ? totalAmount : 0,
      originalAmount: days * vehicleDoc.pricePerDay,
      discount,
      couponCode: coupon?.code || null,
      pickupLocation: pickupLocation || 'Nagpur',
      status: 'CONFIRMED',
      paymentStatus: 'PENDING'
    });

    await booking.save();
    const pop = await Booking.findById(booking._id).populate('vehicle').populate('user','name email');

    try{
      await sendBookingEmail({
        to: pop.user.email,
        bookingNumber: pop.bookingNumber,
        vehicleName: pop.vehicle.name || `${pop.vehicle.brand} ${pop.vehicle.model}`,
        pickupDate: sDate,
        returnDate: eDate,
        totalAmount: pop.totalAmount
      });
    }catch(e){ console.log("Email fail:", e.message) }

    res.status(201).json(pop);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


const myBookingsHandler = async (req,res)=>{
  try{
    const bookings = await Booking.find({ user: req.user.id }).populate('vehicle').sort({createdAt: -1});
    res.json(bookings);
  }catch(e){ res.status(500).json({message: e.message}) }
};
router.get('/my', auth, myBookingsHandler);
router.get('/mybookings', auth, myBookingsHandler);


router.put('/:id/complete', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin only" });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = 'COMPLETED';
    booking.paymentStatus = 'PAID';
    await booking.save({ validateBeforeSave: false });

    const updated = await Booking.findById(booking._id).populate('vehicle').populate('user','name email');
    res.json({ message: "Booking completed successfully", booking: updated });
  } catch (e) {
    console.log("Complete Error:", e.message);
    res.status(500).json({ message: e.message });
  }
});


router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    booking.status = 'CANCELLED';
    await booking.save({ validateBeforeSave: false });

    if (booking.couponCode) {
      const c = await Coupon.findOne({ code: booking.couponCode });
      if (c && c.usedCount > 0) { c.usedCount -= 1; await c.save(); }
    }

    res.json({ message: "Booking cancelled successfully", booking });

  } catch (e) {
    console.log("Cancel Error:", e.message);
    res.status(500).json({ message: e.message });
  }
});


router.put('/:id/reschedule', auth, async (req, res) => {
  try {
    const { pickupDate, returnDate, startDate, endDate } = req.body;
    const sDate = pickupDate || startDate;
    const eDate = returnDate || endDate;

    if(!sDate || !eDate){
      return res.status(400).json({ message: "New pickup and return dates required" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return res.status(400).json({ message: `Cannot reschedule ${booking.status} booking` });
    }

    const newPickup = new Date(sDate);
    const newReturn = new Date(eDate);

    if(newReturn <= newPickup){
      return res.status(400).json({ message: "Return date must be after pickup date" });
    }

    const days = Math.ceil((newReturn - newPickup) / (1000*60*60*24)) || 1;
    
    booking.previousPickupDate = booking.pickupDate;
    booking.previousReturnDate = booking.returnDate;
    booking.pickupDate = newPickup;
    booking.returnDate = newReturn;
    booking.startDate = newPickup;
    booking.endDate = newReturn;
    booking.rentalDays = days;
    booking.totalAmount = days * booking.pricePerDay - (booking.discount || 0);
    booking.originalAmount = days * booking.pricePerDay;
    booking.isRescheduled = true;
    booking.rescheduledAt = new Date();
    booking.status = 'CONFIRMED';

    await booking.save();
    const updated = await Booking.findById(booking._id).populate('vehicle').populate('user','name email');

    res.json({ message: "Booking rescheduled successfully", booking: updated });

  } catch (e) {
    console.log("Reschedule Error:", e.message);
    res.status(500).json({ message: e.message });
  }
});


router.get('/:id', auth, async (req,res)=>{
  try{
    if(req.params.id === 'my' || req.params.id === 'mybookings' || req.params.id.includes('booked-dates') || req.params.id === 'all-debug') {
      return res.status(400).json({message: "Invalid ID"});
    }
    
    const booking = await Booking.findById(req.params.id).populate('vehicle').populate('user','name email phone');
    if(!booking) return res.status(404).json({ message: "Booking not found" });
    
    if(booking.user._id.toString() !== req.user.id && req.user.role !== 'admin'){
      return res.status(403).json({message: "Not authorized"});
    }
    res.json(booking);
  }catch(e){
    console.log("GetById Error:", e.message);
    res.status(500).json({ message: e.message });
  }
});

export default router;