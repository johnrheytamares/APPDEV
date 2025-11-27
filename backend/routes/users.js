// routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// GET all users (with search, role filter, pagination)
router.get('/', async (req, res) => {
  try {
    const { q = '', role = 'all', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT UserID as id, FirstName, LastName, Email, ContactNumber, 
             role, status, created_at, is_verified
      FROM users 
      WHERE status != 'deleted'
    `;
    let countSql = `SELECT COUNT(*) as total FROM users WHERE status != 'deleted'`;
    const params = [];
    const countParams = [];

    if (q) {
      sql += ` AND (FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ?)`;
      countSql += ` AND (FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ?)`;
      const search = `%${q}%`;
      params.push(search, search, search);
      countParams.push(search, search, search);
    }

    if (role !== 'all') {
      sql += ` AND role = ?`;
      countSql += ` AND role = ?`;
      params.push(role);
      countParams.push(role);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(sql, params);
    const [[{ total }]] = await db.query(countSql, countParams);

    // Combine name
    const users = rows.map(user => ({
      ...user,
      name: `${user.FirstName} ${user.LastName}`.trim()
    }));

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT UserID, FirstName, LastName, Email, ContactNumber, role, status FROM users WHERE UserID = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    user.name = `${user.FirstName} ${user.LastName}`;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE user
router.post('/', async (req, res) => {
  try {
    const { FirstName, LastName, Email, Password, ContactNumber, role = 'customer' } = req.body;

    if (!FirstName || !LastName || !Email || !Password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email exists
    const [existing] = await db.query('SELECT UserID FROM users WHERE Email = ?', [Email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const [result] = await db.query(
      `INSERT INTO users (FirstName, LastName, Email, Password, ContactNumber, role, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [FirstName, LastName, Email, hashedPassword, ContactNumber || null, role]
    );

    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE user
router.put('/:id', async (req, res) => {
  try {
    const { FirstName, LastName, Email, Password, ContactNumber, role, status } = req.body;

    const fields = [];
    const values = [];

    if (FirstName) { fields.push('FirstName = ?'); values.push(FirstName); }
    if (LastName) { fields.push('LastName = ?'); values.push(LastName); }
    if (Email) { fields.push('Email = ?'); values.push(Email); }
    if (ContactNumber !== undefined) { fields.push('ContactNumber = ?'); values.push(ContactNumber || null); }
    if (role) { fields.push('role = ?'); values.push(role); }
    if (status) { fields.push('status = ?'); values.push(status); }
    if (Password) {
      const hashed = await bcrypt.hash(Password, 10);
      fields.push('Password = ?');
      values.push(hashed);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE UserID = ?`, values);

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// SOFT DELETE or SUSPEND user
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE users SET status = "deleted" WHERE UserID = ?', [req.params.id]);
    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;