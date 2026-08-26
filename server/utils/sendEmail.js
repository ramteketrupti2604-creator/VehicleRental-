import nodemailer from 'nodemailer';

export const sendBookingEmail = async ({ to, bookingNumber, vehicleName, pickupDate, returnDate, totalAmount }) => {
  try {
    console.log("Trying to send email to:", to);
    console.log("From:", process.env.EMAIL_USER);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Vehicle Rental - Wardha" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Booking Confirmed - ${bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: green;">✅ Booking Confirmed!</h2>
          <p>Thank you for booking with us!</p>
          <div style="background: #f5f7fb; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <p><b>Booking Number:</b> ${bookingNumber}</p>
            <p><b>Vehicle:</b> ${vehicleName}</p>
            <p><b>Pickup:</b> ${pickupDate}</p>
            <p><b>Return:</b> ${returnDate}</p>
            <p><b>Total Amount:</b> ₹${totalAmount}</p>
          </div>
          <p style="font-size: 12px; color: #888;">Wardha • Nagpur • Mumbai - Vehicle Rental System</p>
          <p>Safe Journey!</p>
        </div>
      `
    });

    console.log("📧 Email sent SUCCESS:", info.messageId);
    return true;
  } catch (error) {
    console.log("❌ EMAIL ERROR FULL:", error.message);
    return false;
  }
};