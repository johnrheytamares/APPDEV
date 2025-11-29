// backend/routes/contact.js — FINAL WORKING VERSION!

const express = require('express');
const router = express.Router();
const pool = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: process.env.GMAIL_USER,     // ← from .env
    pass: process.env.GMAIL_PASS      // ← from .env (App Password!)
  },
  tls: { rejectUnauthorized: false }  // ← magic line para gumana sa localhost
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    // 1. Save to DB
    const { insertId } = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, subject, message]
    );

    console.log(`Contact saved! ID: ${insertId}`);

    // 2. Send Email
    const mailOptions = {
      from: `"Eduardo's Resort" <${process.env.GMAIL_USER}>`,
      to: 'johnrheynedamo2005@gmail.com',
      replyTo: email,
      subject: `New Message: ${subject}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <br><small>Sent from Eduardo's Resort website</small>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');

    // SUCCESS RESPONSE (ISANG BESSES LANG!)
    res.json({ 
      success: true, 
      message: 'Salamat! Nakatanggap na kami ng iyong mensahe. Rereply-an ka namin sa loob ng 24 hours.',
      id: insertId
    });

  } catch (err) {
    console.error('CONTACT FORM ERROR:', err.message);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;