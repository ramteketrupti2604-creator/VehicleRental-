# 🚗 Vehicle Rental System - MERN Stack

### 📌 Project Overview
A complete MERN Stack based Vehicle Rental Platform where customers can browse vehicles, check availability, book cars and manage bookings. Admin can manage fleet, bookings and customers.

### ✨ Key Features
**Customer Panel**
- JWT Authentication - Register / Login
- Browse Vehicles, Search, Filter, Pagination
- Vehicle Details Page
- Date-based Booking with Availability Check
- Booking Summary & Confirmation
- My Bookings & Booking Details
- Email Confirmation (Working)

**Admin Panel**
- Admin Dashboard with Stats
- Vehicle Management (Add/Edit/Delete)
- Category Management (couponRoutes, categoryRoutes)
- Booking Management (paymentRoutes, userRoutes, vehicleRoutes)
- Customer Management
- Booking Helper & Token Generation

### 🛠️ Tech Stack
**Frontend:** React.js, Axios, Context API
**Backend:** Node.js, Express.js (routes, utils, vehicle.js)
**Database:** MongoDB
**Extra:** Nodemailer (sendEmail.js), Cloudinary (cloudinary.js), JWT

### 📂 Project Structure
VehicleRental/
├── client/ (React Frontend)
└── server/
    ├── routes/ (category, coupon, payment, user, vehicle)
    ├── utils/ (bookingHelper, cloudinary, generateBookingNumber, sendEmail)
    ├── .env
    └── http://server.js
└── http://README.md

### 🚀 How to Run
**Backend**
cd server
npm install
node http://server.js
Server running on http://localhost:5000

**Frontend**
cd client
npm install
npm start

### 🔐 Credentials
**Admin:** admin@rental.com / Admin@123
**User:** user@rental.com / User@123

### 👩‍💻 Developed By
**Trupti Ramteke**
MERN Stack Internship Project 
