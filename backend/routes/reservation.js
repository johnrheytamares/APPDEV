// backend/routes/reservation.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ==================== GET ALL BOOKINGS (with filters & pagination) ====================
router.get('/', async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      status,
      search,
      from,
      to,
      source
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM bookings`;
    let countQuery = `SELECT COUNT(*) as total FROM bookings`;
    let where = [];
    let params = [];
    let countParams = [];

    if (status && status !== 'all') {
      where.push('status = ?');
      params.push(status);
      countParams.push(status);
    }
    if (search) {
      where.push(`(guest_name LIKE ? OR email LIKE ? OR reservation_code LIKE ? OR phone LIKE ?)`);
      const like = `%${search}%`;
      params.push(like, like, like, like);
      countParams.push(like, like, like, like);
    }
    if (from) {
      where.push('check_in >= ?');
      params.push(from);
      countParams.push(from);
    }
    if (to) {
      where.push('check_out <= ?');
      params.push(to);
      countParams.push(to);
    }
    if (source && source !== 'all') {
      where.push('booking_source = ?');
      params.push(source);
      countParams.push(source);
    }

    if (where.length > 0) {
      const whereClause = ' WHERE ' + where.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      bookings: rows,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (err) {
    console.error('GET BOOKINGS ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== UPDATE STATUS (Confirm, Cancel, Check-in, Check-out) ====================
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // confirmed, cancelled, checked_in, checked_out, no_show

  const validStatuses = ['confirmed', 'cancelled', 'checked_in', 'checked_out', 'no_show'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // Update status + timestamps
    let updateQuery = 'UPDATE bookings SET status = ?, updated_at = NOW()';
    let params = [status];

    if (status === 'checked_in') {
      updateQuery += ', checked_in_at = NOW()';
    }
    if (status === 'checked_out') {
      updateQuery += ', checked_out_at = NOW()';
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(updateQuery, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Get updated booking with email
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    const booking = rows[0];

    // SEND EMAIL
    const templates = {
      confirmed: {
        subject: 'Your Booking is Confirmed!',
        message: `Hi ${booking.guest_name},\n\nYour reservation (Code: ${booking.reservation_code}) has been CONFIRMED!\n\nCheck-in: ${booking.check_in}\nCheck-out: ${booking.check_out}\nRoom: ${booking.item}\n\nSee you soon!\n\nEduardo's Resort`
      },
      cancelled: {
        subject: 'Booking Cancelled',
        message: `Hi ${booking.guest_name},\n\nWe're sorry, but your booking (${booking.reservation_code}) has been cancelled.\n\nIf this was a mistake, please contact us immediately.\n\nThank you.`
      },
      checked_in: {
        subject: 'Welcome to Eduardo\'s Resort!',
        message: `Hi ${booking.guest_name},\n\nYou have successfully checked in!\n\nEnjoy your stay at our beautiful resort!\n\nNeed anything? Just ask our staff.\n\nWarm regards,\nFront Desk Team`
      },
      checked_out: {
        subject: 'Thank You for Staying With Us!',
        message: `Hi ${booking.guest_name},\n\nThank you for choosing Eduardo's Resort!\n\nWe hope you had a wonderful stay.\n\nYou're always welcome back!\n\nSafe travels,\nEduardo's Resort Team`
      },
      no_show: {
        subject: 'Missed Check-in (No Show)',
        message: `Hi ${booking.guest_name},\n\nWe noticed you didn't check in for your reservation (${booking.reservation_code}).\n\nIf you still plan to arrive, please contact us ASAP.\n\nThank you.`
      }
    };

    const email = templates[status];
    if (email) {
      await sendBookingEmail(booking.email, email.subject, email.message);
    }

    res.json({ success: true, message: 'Status updated & email sent!' });

  } catch (err) {
    console.error('STATUS UPDATE ERROR:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// ==================== DELETE BOOKING ====================
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;