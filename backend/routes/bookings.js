// backend/routes/booking.js — FINAL NA TALAGA ‘TO, ZERO ERROR!

const express = require('express');
const router = express.Router();
const pool = require('../db');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Create QR folder if not exists
const qrDir = path.join(__dirname, '../public/qr');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});
router.post('/', async (req, res) => {
  res.json({ message: 'Bookings API is working!' });
});


router.get('/test', (req, res) => {
  res.json({ message: 'Reservation route is working!' });
});

// ==================== CREATE BOOKING ====================
router.post('/create', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const data = req.body;

    // Make sure userId exists
    if (!data.userId) {
      return res.status(400).json({ error: 'Missing userId for this booking' });
    }

    // Calculate nights (if not provided)
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // INSERT BOOKING
    const [result] = await connection.query(
      `INSERT INTO bookings 
      (user_id, booking_id, guest_name, email, phone, check_in, check_out, nights, adults, children, total_amount, items, payment_method, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [
        data.userId,               // ← USER ID NOW SAVED
        data.bookingId,
        data.guest.fullName,
        data.guest.email,
        data.guest.phone,
        data.checkIn.split('T')[0],
        data.checkOut.split('T')[0],
        nights,
        data.guest.adults,
        data.guest.children,
        data.total,
        JSON.stringify(data.items),
        data.selectedPayment
      ]
    );

    // GENERATE QR CODE
    const qrData = `https://eduardosresort.com/checkin?booking=${data.bookingId}`;
    const qrPath = path.join(qrDir, `${data.bookingId}.png`);
    await QRCode.toFile(qrPath, qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#2B6CB0', light: '#FFFFFF' }
    });

    // Update QR path in DB
    await connection.query(
      'UPDATE bookings SET qr_code = ? WHERE booking_id = ?',
      [`/qr/${data.bookingId}.png`, data.bookingId]
    );

    // SEND EMAIL TO GUEST
    await transporter.sendMail({
      from: `"Eduardo's Resort" <${process.env.GMAIL_USER}>`,
      to: data.guest.email,
      subject: `Booking Confirmed! #${data.bookingId}`,
      html: `
        <h1>Thank you, ${data.guest.fullName}!</h1>
        <p>Your booking is confirmed!</p>
        <p><strong>Booking ID:</strong> ${data.bookingId}</p>
        <p><strong>Check-in:</strong> ${data.checkIn.split('T')[0]}</p>
        <p><strong>Check-out:</strong> ${data.checkOut.split('T')[0]}</p>
        <p><strong>Total:</strong> ₱${data.total.toLocaleString()}</p>
        <hr>
        <p>Show this QR code upon arrival:</p>
        <img src="cid:qrCode" alt="QR Code" style="width:200px;height:200px;">
      `,
      attachments: [{
        filename: 'qrcode.png',
        path: qrPath,
        cid: 'qrCode'
      }]
    });

    // SEND TO ADMIN
    await transporter.sendMail({
      from: `"System" <${process.env.GMAIL_USER}>`,
      to: 'eduardosresort.official@gmail.com',
      subject: `NEW BOOKING: ${data.bookingId}`,
      text: `New booking from ${data.guest.fullName}\nUserID: ${data.userId}\nTotal: ₱${data.total}\nEmail: ${data.guest.email}\nPhone: ${data.guest.phone}\n\nFull Data:\n${JSON.stringify(data, null, 2)}`
    });

    await connection.commit();
    res.json({ success: true, bookingId: data.bookingId });

  } catch (err) {
    console.error('BOOKING ERROR:', err);
    if (connection) await connection.rollback();
    res.status(500).json({ 
      error: 'Failed to confirm booking', 
      details: err.message,
      code: err.code || 'UNKNOWN'
    });
  } finally {
    if (connection) connection.release();
  }
});


module.exports = router;