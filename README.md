# 🚗 Vehicle Rental System — MERN Stack Internship Assignment

### 🔐 Test Credentials (For Evaluator)
| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@rental.com` | `Admin@123` | /admin - Full fleet, bookings, customers, revenue stats |
| **Customer** | `user@rental.com` | `User@123` | / - Browse, Book, My Bookings, Reschedule, Cancel |

> **Note:** If login fails, register a new customer or use seed data: `node seed.js`

---

### 🎯 Project Overview
A complete MERN Stack Vehicle Rental Platform built in 7 days. Customers can browse vehicles, check availability for selected dates, calculate rental costs, make/cancel/reschedule bookings. Admin can manage fleet, categories, bookings and view dashboard statistics.

**Stack:** MongoDB, Express.js, React.js, Node.js

### ✨ Key Features Implemented (As per PDF)

**Customer:**
- JWT Auth - Register/Login (bcrypt + unique email validation)
- Vehicle Listing: Image, Name, Brand/Model, Category, Seats, Fuel, Transmission, Price/day, Location, Availability
- Search & Filters: name/brand/model, category, location, fuel, transmission, min/max price, sort, pagination
- Vehicle Details + Rent This Vehicle + Booked Dates Calendar blocking
- Rental Logic: Pickup/Return Date validation, Overlap check, RentalDays calculation
- Booking Summary: Vehicle, Dates, Days, PricePerDay, Total (Backend-calculated)
- Booking Confirmation: Unique Booking Number `VR-20260820-0001`
- My Bookings: Upcoming/Completed/Cancelled filter + 24h cancellation rule (backend enforced)
- **Reschedule Booking: Change pickup/return dates from My Bookings**
- PDF Receipt Download + Email Confirmation

**Admin:**
- Dashboard: Total Vehicles, Available Vehicles, Active Bookings, Total Customers, Total Revenue + Recent Bookings Table
- Vehicle Management: Add/Edit/Delete/Status Change (AVAILABLE/UNAVAILABLE/MAINTENANCE) + Cloudinary Upload
- Category Management: Hatchback, Sedan, SUV, MUV, Luxury, Electric - CRUD
- Booking Management: View/Filter/Confirm/Cancel/Complete + Status Update API
- Customer Management: Name, Email, Phone, No. of Bookings, Registration Date

### 🔒 Availability & Booking Logic (Documented)
```js
// Overlap Check - Backend
if (newPickup < existingReturn && newReturn > existingPickup) => REJECT
RentalDays = ceil((ReturnDate - PickupDate) / 1 day)
Total = RentalDays * pricePerDay (from DB, not frontend)
Cancellation: allowed only if (pickupDate - now) > 24 hours
Reschedule: allowed only if status is CONFIRMED/PENDING

### 🛠️ Tech Stack
Frontend: React.js, Axios, Context API, Tailwind CSS, React Router, jsPDF
Backend: Node.js, Express.js, JWT, Mongoose, Multer, bcryptjs
Database: MongoDB Atlas
Extra: Cloudinary, Nodemailer, Swagger UI

### 📂 Structure
server/
├── models/ (bookingModel.js, vehicleModel.js, userModel.js, couponModel.js)
├── routes/ (authRoutes.js, vehicleRoutes.js, adminRoutes.js, etc)
├── middleware/ (authMiddleware.js)
├── utils/ (sendEmail.js)
└── server.js

client/
├── src/pages/ (MyBookings.jsx, VehicleDetails.jsx, AdminDashboard.jsx)
└── src/context/

### 🚀 How to Run
*Backend*
cd server
npm install
 node server.js
# Backend: http://localhost:5000
# Swagger: http://localhost:5000/api-docs

Frontend:
cd client
npm install
npm start
# Frontend: http://localhost:3000

### 🔧 .env Example
MONGO_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
VITE_API_URL=http://localhost:5000/api

📚 API Documentation
Swagger UI available at http://localhost:5000/api-docs
Interactive API testing with "Try it out"
Auth via Bearer Token

🎁 Bonus Features Implemented
✓ Cloudinary Upload ✓ Nodemailer Email ✓ PDF Receipt ✓ Revenue Analytics Chart 
✓ Ratings & Reviews ✓ Google Maps ✓ Coupon WELCOME10 ✓ Reschedule ✓ Swagger Docs

### 👩‍💻 Developed By
*Trupti Ramteke* | Full Stack Internship Project | 2026

