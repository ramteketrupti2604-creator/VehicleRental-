import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import seedRoute from './routes/seedRoute.js'; 
import Coupon from './models/couponModel.js';

import { protect, admin } from './middleware/authMiddleware.js';
import Booking from "./models/bookingModel.js";
import Vehicle from "./models/vehicleModel.js";
import User from "./models/userModel.js";
import { sendBookingEmail } from './utils/sendEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("ENV -> MONGO_URI:", process.env.MONGO_URI ? "Found ✅ " : "MISSING ❌");
console.log("ENV -> PORT:", process.env.PORT || 5000);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { 
      title: "Vehicle Rental System API", 
      version: "1.0.0",
      description: "MERN Stack Internship Assignment - Complete API Documentation" 
    },
    servers: [{ url: "http://localhost:5000" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    tags: [
      { name: "Auth", description: "Authentication" },
      { name: "Vehicles", description: "Vehicle listing & details" },
      { name: "Bookings", description: "Rental & Booking logic - Availability check" },
      { name: "Admin", description: "Admin Dashboard & Stats" },
      { name: "Categories", description: "Vehicle Categories" },
    ],
    paths: {
      "/": { get: { summary: "API Running Check", tags: ["Auth"], responses: { 200: { description: "OK" } } } },
      "/api/auth/login": { post: { summary: "Login - Customer/Admin", tags: ["Auth"], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } } }, responses: { 200: { description: "Login success" } } } },
      "/api/auth/register": { post: { summary: "Register Customer", tags: ["Auth"], responses: { 201: { description: "Created" } } } },
      "/api/vehicles": { get: { summary: "Get Vehicles - Search, Filter, Sort, Pagination", tags: ["Vehicles"], parameters: [{ name: "search", in: "query", schema: { type: "string" } }, { name: "category", in: "query", schema: { type: "string" } }, { name: "location", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Vehicle list" } } } },
      "/api/vehicles/{id}": { get: { summary: "Vehicle Details by ID", tags: ["Vehicles"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Vehicle detail" } } } },
      "/api/vehicles/{id}/booked-dates": { get: { summary: "Get Booked Dates for calendar blocking", tags: ["Vehicles"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Booked dates" } } } },
      "/api/bookings": {
        post: { summary: "Create Booking - Backend calculates price & checks overlapping", tags: ["Bookings"], security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { vehicle: { type: "string" }, pickupDate: { type: "string" }, returnDate: { type: "string" }, pickupLocation: { type: "string" }, couponCode: { type: "string" } } } } } }, responses: { 201: { description: "Booking confirmed" } } },
        get: { summary: "All Bookings - Admin only", tags: ["Bookings"], security: [{ bearerAuth: [] }], responses: { 200: { description: "All bookings" } } }
      },
      "/api/bookings/my": { get: { summary: "My Bookings - Current User", tags: ["Bookings"], security: [{ bearerAuth: [] }], responses: { 200: { description: "My bookings" } } } },
      "/api/bookings/mybookings": { get: { summary: "My Bookings Alias", tags: ["Bookings"], security: [{ bearerAuth: [] }], responses: { 200: { description: "My bookings" } } } },
      "/api/bookings/{id}": { get: { summary: "Booking Details by ID", tags: ["Bookings"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Booking details" } } } },
      "/api/bookings/{id}/cancel": { put: { summary: "Cancel Booking - 24hr rule enforced", tags: ["Bookings"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Cancelled" } } } },
      "/api/bookings/{id}/status": { put: { summary: "Admin Update Booking Status - Complete/Cancel", tags: ["Bookings"], security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Status updated" } } } },
      "/api/admin/stats": { get: { summary: "Admin Dashboard Stats", tags: ["Admin"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Stats: totalVehicles, availableVehicles, activeBookings, customers, revenue, recentBookings" } } } },
      "/api/categories": { get: { summary: "Get Categories", tags: ["Categories"], responses: { 200: { description: "Categories list" } } }, post: { summary: "Create Category - Admin", tags: ["Categories"], security: [{ bearerAuth: [] }], responses: { 201: { description: "Created" } } } }
    }
  },
  apis: [],
};
const swaggerSpecs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: true }));

const statsLogic = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'AVAILABLE' });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['PENDING', 'CONFIRMED'] } });
    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });
    const revenueAgg = await Booking.aggregate([{ $match: { status: { $ne: 'CANCELLED' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const recentBookings = await Booking.find({}).populate('vehicle', 'name brand model').populate('user', 'name email').sort({ createdAt: -1 }).limit(6);
    res.json({ totalVehicles, availableVehicles, activeBookings, totalCustomers, totalRevenue: revenueAgg[0]?.total || 0, recentBookings });
  } catch(e){ res.status(500).json({ message: e.message }) }
};

app.get('/api/admin/stats', protect, admin, statsLogic);
app.get('/api/admin/dashboard', protect, admin, statsLogic);
app.get('/api/dashboard-stats', protect, admin, statsLogic);

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/seed', seedRoute); 

app.get('/api/bookings/vehicle/:id/booked-dates', async (req, res) => {
  try {
    const bookings = await Booking.find({ vehicle: req.params.id, status: { $in: ['PENDING', 'CONFIRMED'] } });
    let allDates = []; bookings.forEach(b => { let curr = new Date(b.pickupDate || b.startDate); let end = new Date(b.returnDate || b.endDate); curr.setHours(0,0,0,0); end.setHours(0,0,0,0); while(curr <= end){ allDates.push(new Date(curr)); curr.setDate(curr.getDate()+1);} }); 
    res.json({ bookedDates: allDates });
  } catch(e){ res.json({ bookedDates: [] }); }
});

app.get('/api/vehicles/:id/booked-dates', async (req, res) => {
  try {
    const bookings = await Booking.find({ vehicle: req.params.id, status: { $ne: 'CANCELLED' } });
    let allDates = []; bookings.forEach(b => { let curr = new Date(b.pickupDate || b.startDate); let end = new Date(b.returnDate || b.endDate); curr.setHours(0,0,0,0); end.setHours(0,0,0,0); while(curr <= end){ allDates.push(new Date(curr)); curr.setDate(curr.getDate()+1);} }); 
    res.json({ bookedDates: allDates });
  } catch(e){ res.json({ bookedDates: [] }); }
});

app.post('/api/bookings', protect, async (req,res) => {
  try {
    const { vehicle, pickupDate, returnDate, pickupLocation, couponCode } = req.body;
    const pickup = new Date(pickupDate); const returnD = new Date(returnDate); 
    if (!pickupDate || !returnDate) return res.status(400).json({ message: "Dates required" });
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) return res.status(404).json({ message: "Vehicle not found" });
    const overlapping = await Booking.findOne({ vehicle: vehicle, status: { $in: ['PENDING','CONFIRMED'] }, pickupDate: { $lt: returnD }, returnDate: { $gt: pickup } });
    if (overlapping) return res.status(400).json({ message: "Already booked" });
    const days = Math.ceil((returnD - pickup)/(1000*60*60*24)) || 1; 
    let total = days * vehicleDoc.pricePerDay; let discount = 0; let appliedCoupon = null;
    if(couponCode){ 
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true }); 
      if(coupon && new Date(coupon.expiryDate) > new Date()){
        discount = coupon.discountType === 'PERCENT'? (total * coupon.discountValue / 100) : coupon.discountValue; 
        if(coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount); 
        total = total - discount; appliedCoupon = coupon.code; 
        coupon.usedCount += 1; await coupon.save(); 
      }
    }
    const booking = await Booking.create({ 
      bookingNumber: `VR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000+Math.random()*9000)}`, 
      vehicle, user: req.user._id, pickupDate: pickup, returnDate: returnD, rentalDays: days, 
      totalAmount: total, pricePerDay: vehicleDoc.pricePerDay, 
      pickupLocation: pickupLocation || vehicleDoc.location, status: 'CONFIRMED', paymentStatus: 'PENDING', 
      couponCode: appliedCoupon, discountAmount: discount 
    });
    const populated = await Booking.findById(booking._id).populate('vehicle').populate('user','name email');
    try { await sendBookingEmail({ to: populated.user.email, bookingNumber: populated.bookingNumber, vehicleName: populated.vehicle.name, pickupDate: populated.pickupDate.toDateString(), returnDate: populated.returnDate.toDateString(), totalAmount: populated.totalAmount }); } catch(e){ console.log("Email fail:", e.message); }
    res.status(201).json(populated);
  } catch(e){ res.status(400).json({ message: e.message }) }
});

app.get('/api/bookings/my', protect, async (req, res) => { 
  try { 
    const bookings = await Booking.find({ user: req.user._id }).populate("vehicle").sort({ createdAt: -1 }); 
    res.json(bookings); 
  } catch(e){ res.status(500).json({ message: e.message }) } 
});
app.get('/api/bookings/mybookings', protect, async (req, res) => { 
  try { 
    const bookings = await Booking.find({ user: req.user._id }).populate("vehicle").sort({ createdAt: -1 }); 
    res.json(bookings); 
  } catch(e){ res.status(500).json({ message: e.message }) } 
});
app.get('/api/bookings/my-bookings', protect, async (req, res) => { 
  try { 
    const bookings = await Booking.find({ user: req.user._id }).populate("vehicle").sort({ createdAt: -1 }); 
    res.json(bookings); 
  } catch(e){ res.status(500).json({ message: e.message }) } 
});

app.get('/api/bookings', protect, admin, async (req, res) => { 
  try { 
    const bookings = await Booking.find({}).populate("vehicle").populate("user","name email phone").sort({ createdAt: -1 }); 
    res.json(bookings); 
  } catch(e){ res.status(500).json({ message: e.message }) } 
});

app.get('/api/bookings/:id', protect, async (req, res) => { 
  try { 
    const id = req.params.id;
    if(id === 'my' || id === 'mybookings' || id === 'vehicle') return res.status(400).json({ message: "Invalid ID" });
    console.log("Fetching Booking ID:", id);
    const booking = await Booking.findById(id).populate("vehicle").populate("user","name email phone"); 
    if (!booking) return res.status(404).json({ message: "Booking not found" }); 
    res.json(booking); 
  } catch(e){ res.status(500).json({ message: e.message }) } 
});


app.put('/api/bookings/:id/cancel', protect, async (req,res) => { 
  try { 
    const booking = await Booking.findById(req.params.id); 
    if (!booking) return res.status(404).json({ message: "Booking not found" }); 

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    const now = new Date();
    const pickup = new Date(booking.pickupDate || booking.startDate);
    const hoursLeft = (pickup - now) / (1000 * 60 * 60);
    
    console.log(`CANCEL CHECK -> Pickup: ${pickup.toLocaleString()} | Now: ${now.toLocaleString()} | HoursLeft: ${hoursLeft.toFixed(2)}`);

    if (hoursLeft < 24) {
      return res.status(400).json({ message: "Cannot cancel within 24 hours of pickup time" });
    }

    booking.status = 'CANCELLED'; 
    await booking.save(); 

    if (booking.couponCode) {
      const c = await Coupon.findOne({ code: booking.couponCode });
      if (c && c.usedCount > 0) { c.usedCount -= 1; await c.save(); }
    }

    res.json({ message: "Booking cancelled successfully", booking }); 
  } catch(e){ 
    console.log("Cancel Error:", e.message);
    res.status(500).json({ message: e.message }) 
  } 
});


app.put('/api/bookings/:id/reschedule', protect, async (req, res) => {
  try {
    console.log("RESCHEDULE HIT -> ID:", req.params.id, "BODY:", req.body);
    const { pickupDate, returnDate, startDate, endDate } = req.body;
    const sDate = pickupDate || startDate;
    const eDate = returnDate || endDate;

    if(!sDate || !eDate){
      return res.status(400).json({ message: "New pickup and return dates required" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
    
    booking.pickupDate = newPickup;
    booking.returnDate = newReturn;
    booking.rentalDays = days;
    booking.totalAmount = days * booking.pricePerDay;
    booking.status = 'CONFIRMED';

    await booking.save();
    const updated = await Booking.findById(booking._id).populate('vehicle').populate('user','name email');

    console.log("RESCHEDULE SUCCESS ->", updated.bookingNumber);
    res.json({ message: "Booking rescheduled successfully", booking: updated });

  } catch (e) {
    console.log("Reschedule Error:", e.message);
    res.status(500).json({ message: e.message });
  }
});


app.put('/api/bookings/:id/status', protect, admin, async (req,res) => { 
  try { 
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id); 
    if (!booking) return res.status(404).json({ message: "Booking not found" }); 
    
    if(!['CONFIRMED','CANCELLED','COMPLETED','PENDING'].includes(status)){
      return res.status(400).json({ message: "Invalid status: " + status });
    }

    booking.status = status; 
    if(status === 'COMPLETED') booking.paymentStatus = 'PAID';
    await booking.save(); 
    console.log(`ADMIN STATUS UPDATE -> ${booking.bookingNumber} -> ${status}`);
    res.json({ message: `Booking ${status} successfully`, booking }); 
  } catch(e){ 
    console.log("Status Update Error:", e.message);
    res.status(500).json({ message: e.message }) 
  } 
});


app.put('/api/bookings/:id/complete', protect, admin, async (req,res) => { 
  try { 
    const booking = await Booking.findById(req.params.id); 
    if (!booking) return res.status(404).json({ message: "Booking not found" }); 
    booking.status = 'COMPLETED'; 
    booking.paymentStatus = 'PAID';
    await booking.save(); 
    res.json({ message: "Booking completed", booking }); 
  } catch(e){ 
    res.status(500).json({ message: e.message }) 
  } 
});

app.put('/api/admin/bookings/:id/status', protect, admin, async (req,res) => { 
  try { 
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id); 
    if (!booking) return res.status(404).json({ message: "Booking not found" }); 
    booking.status = status; 
    if(status === 'COMPLETED') booking.paymentStatus = 'PAID';
    await booking.save(); 
    res.json({ message: `Booking ${status} successfully`, booking }); 
  } catch(e){ 
    res.status(500).json({ message: e.message }) 
  } 
});

app.get('/', (req, res) => res.send('Vehicle Rental API Running... ✅'));


console.log("Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected ✅');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server Running: http://localhost:${PORT}`);
      console.log(`Docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error("MongoDB Failed ❌:", err.message);
  });

export default app;