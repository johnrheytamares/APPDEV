// backend/routes/booking.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

router.post('/create', async (req, res) => {
  try {
    const data = req.body;

    // Save to DB
    const [result] = await pool.query(
      `INSERT INTO bookings 
      (booking_id, guest_name, email, phone, check_in, check_out, nights, adults, children, total_amount, items, payment_method, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [
        data.bookingId,
        data.guest.fullName,
        data.guest.email,
        data.guest.phone,
        data.checkIn.split('T')[0],
        data.checkOut.split('T')[0],
        data.nights,
        data.guest.adults,
        data.guest.children,
        data.total,
        JSON.stringify(data.items),
        data.selectedPayment
      ]
    );

    // Send Email to Guest
    await transporter.sendMail({
      from: `"Eduardo's Resort" <${process.env.GMAIL_USER}>`,
      to: data.guest.email,
      subject: `Booking Confirmed! #${data.bookingId}`,
      html: `<h1>Thank you, ${data.guest.fullName}!</h1><p>Your booking is confirmed.</p><p><strong>Booking ID:</strong> ${data.bookingId}</p><p>See you soon!</p>`
    });

    // Send to Admin
    await transporter.sendMail({
      from: `"System" <${process.env.GMAIL_USER}>`,
      to: 'eduardosresort.official@gmail.com',
      subject: `New Booking: ${data.bookingId}`,
      text: JSON.stringify(data, null, 2)
    });

    res.json({ success: true, bookingId: data.bookingId });
  } catch (err) {
    console.error('BOOKING ERROR:', err);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// Inside your /create route, after saving to DB
const qrData = `https://eduardosresort.com/checkin?booking=${data.bookingId}`;
const qrPath = path.join(__dirname, '../public/qr', `${data.bookingId}.png`);

await QRCode.toFile(qrPath, qrData, {
  width: 300,
  margin: 2,
  color: { dark: '#2B6CB0', light: '#FFFFFF' }
});

// Save path sa DB
await pool.query('UPDATE bookings SET qr_code = ? WHERE booking_id = ?', [
  `/qr/${data.bookingId}.png`, data.bookingId
]);

module.exports = router;