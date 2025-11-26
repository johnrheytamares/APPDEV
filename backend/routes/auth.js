// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');


// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email exists
    const [existing] = await pool.query('SELECT * FROM users WHERE Email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Split name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (FirstName, LastName, Email, Password, role, is_verified) 
       VALUES (?, ?, ?, ?, 'customer', 1)`,
      [firstName, lastName, email, hashedPassword]
    );

    // Auto-login after register
    const [newUser] = await pool.query('SELECT * FROM users WHERE UserID = ?', [result.insertId]);

    req.session.user = {
      UserID: newUser[0].UserID,
      name: `${newUser[0].FirstName} ${newUser[0].LastName}`,
      email: newUser[0].Email,
      role: newUser[0].role
    };

    res.json({
      message: 'Account created successfully!',
      user: req.session.user
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TAMA NA ‘TO — WALANG /login KASI app.use('/api/auth', authRoutes)
router.post('/', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const [rows] = await pool.execute('SELECT * FROM users WHERE Email = ?', [Email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(Password, user.Password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    req.session.user = {
      UserID: user.UserID,
      name: `${user.FirstName} ${user.LastName}`,
      email: user.Email,
      role: user.role || 'customer'
    };

    res.json({
      message: 'Login successful!',
      user: req.session.user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;