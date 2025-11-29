// routes/customer.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // ← path mo sa db connection

// ============================================
// GET ALL BOOKINGS NG ISANG CUSTOMER
// ============================================
router.get('/bookings/:customerId', async (req, res) => {
  const { customerId } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        b.*,
        r.name AS room_name,
        r.price AS room_price,
        r.image AS room_image
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `, [customerId]);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching customer bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// ============================================
// GET ALL AVAILABLE ROOMS (para sa Book a Room)
// ============================================
router.get('/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, description, price, image, capacity 
      FROM rooms 
      WHERE available = 1 
      ORDER BY price ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// ============================================
// OPTIONAL: GET SINGLE ROOM BY ID (para sa reservation page)
// ============================================
router.get('/room/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET bookings ng customer with filters
router.get('/bookings/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const { page = 1, limit = 15, search = '', status = '', from = '', to = '' } = req.query;

  let query = `SELECT b.*, r.name as room_name FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.user_id = ?`;
  let params = [customerId];

  if (search) { query += ` AND (b.guest_name LIKE ? OR b.email LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
  if (status) { query += ` AND b.status = ?`; params.push(status); }
  if (from) { query += ` AND b.check_in >= ?`; params.push(from); }
  if (to) { query += ` AND b.check_out <= ?`; params.push(to); }

  query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), (page - 1) * limit);

  try {
    const [bookings] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM bookings WHERE customer_id = ?`, [customerId]);

    res.json({
      bookings,
      total: total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;