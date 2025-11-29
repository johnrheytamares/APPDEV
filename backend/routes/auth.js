// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');


// ==================== REGISTER ====================
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

    // FIXED: Correct way to check existing email
    const [rows] = await pool.query('SELECT 1 FROM users WHERE Email = ? LIMIT 1', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Split name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (FirstName, LastName, Email, Password, role, is_verified, status) 
       VALUES (?, ?, ?, ?, 'customer', 1, 'pending')`,
      [firstName, lastName, email, hashedPassword]
    );

    // Get the new user (FIXED din ‘to)
    const [userRows] = await pool.query(
      'SELECT UserID, FirstName, LastName, Email, role FROM users WHERE UserID = ?',
      [result.insertId]
    );
    const newUser = userRows[0];

    // Auto login via session
    req.session.user = {
      UserID: newUser.UserID,
      name: `${newUser.FirstName} ${newUser.LastName}`.trim(),
      email: newUser.Email,
      role: newUser.role || 'customer'
    };

    return res.json({
      message: 'Account created successfully!',
      user: req.session.user
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    return res.status(500).json({ 
      error: 'Server error', 
      details: err.message  // ← makikita mo rin sa console kung ano talaga ang error
    });
  }
});

// TAMA NA ‘TO — WALANG /login KASI app.use('/api/auth', authRoutes)
// ==================== LOGIN (POST /api/auth) ====================
router.post('/', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // FIXED: Dapat .query() hindi .execute() kapag may placeholder
    const [rows] = await pool.query('SELECT * FROM users WHERE Email = ?', [Email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    // === STATUS CHECK (ito ang kulang mo!) ===
    if (user.status === 'pending' || user.status === 'pending') {
      return res.status(403).json({ 
        error: 'Your account is pending admin approval. Please wait.' 
      });
    }
    if (user.status === 'inactive' || user.status === 'suspended') {
      return res.status(403).json({ 
        error: 'Your account has been deactivated. Contact admin.' 
      });
    }
    if (user.status === 'deleted') {
      return res.status(403).json({ error: 'Account no longer exists.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // SUCCESS! Return user data (hindi mo kailangan session kung frontend-based ka)
    const userData = {
      id: user.UserID,
      name: `${user.FirstName || ''} ${user.LastName || ''}`.trim() || 'User',
      Email: user.Email,
      role: user.role || 'customer'
    };

    res.json({
      success: true,
      message: 'Login successful!',
      user: userData
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;