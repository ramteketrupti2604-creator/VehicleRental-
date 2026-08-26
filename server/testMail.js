import dotenv from 'dotenv';
dotenv.config();
import { sendBookingEmail } from './utils/sendEmail.js';

sendBookingEmail({
  to: "ramteketrupti2604@gmail.com",
  bookingNumber: "TEST123",
  vehicleName: "Thar",
  pickupDate: "26 Aug",
  returnDate: "27 Aug",
  totalAmount: 2000
});