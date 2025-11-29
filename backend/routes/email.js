// utils/email.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // ← palitan mo
    pass: process.env.GMAIL_PASS   // ← Google App Password
  }
});

async function sendBookingEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: `"Eduardo's Resort" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html: text.replace(/\n/g, '<br>')
    });
    console.log('Email sent to:', to);
  } catch (err) {
    console.error('Email failed:', err.message);
  }
}

module.exports = { sendBookingEmail };