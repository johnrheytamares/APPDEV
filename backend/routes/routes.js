const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🟩 GET all products
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 🟦 POST create a product
router.post('/', async (req, res, next) => {
  try {
    const { name, price } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const trimmedName = name.trim();
    if (name !== trimmedName) {
      return res.status(400).json({ error: 'No leading/trailing spaces allowed' });
    }

    const [result] = await pool.execute(
      'INSERT INTO products (name, price) VALUES (?, ?)',
      [trimmedName, price || null]
    );

    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 🟨 PUT update
router.put('/:id', async (req, res, next) => {
  try {
    const { name, price } = req.body;
    await pool.execute(
      'UPDATE products SET name = ?, price = ? WHERE id = ?',
      [name, price || null, req.params.id]
    );
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 🟥 DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;