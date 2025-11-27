// routes/admin/room.js — 100% MATCH SA ACTUAL DB MO NA ‘YAN! (reservision_db.rooms)

const router = require('express').Router();
const pool = require('../../db'); // adjust kung iba path mo
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// === MULTER SETUP — SAVE SA public/uploads/rooms ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../public/uploads/rooms');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==================== GET ALL ROOMS ====================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        room_number,
        room_name AS name,
        room_type AS category,
        Category AS category_label,
        COALESCE(max_guests, capacity) AS max_guests,
        COALESCE(price, price_per_night) AS price,
        room_description AS description,
        images,
        available,
        status
      FROM rooms 
      ORDER BY id DESC
    `);

    // Parse images (LONGTEXT → JSON array)
    rows.forEach(room => {
      if (room.images) {
        try {
          room.images = JSON.parse(room.images);
        } catch {
          room.images = room.images.split(',').map(p => '/uploads/rooms/' + p.trim()).filter(Boolean);
        }
      } else {
        room.images = [];
      }
    });

    res.json(rows);
  } catch (err) {
    console.error('GET ROOMS ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== CREATE ROOM ====================
router.post('/create', upload.array('images', 15), async (req, res) => {
  try {
    const { room_number, name, category, max_guests, price, description } = req.body;

    const imageArray = req.files ? req.files.map(f => '/uploads/rooms/' + f.filename) : [];

    await pool.query(`
      INSERT INTO rooms 
        (room_number, room_name, room_type, Category, max_guests, price, room_description, images, available, status)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, 1, 'available')
    `, [
      category_type || 'room',
      room_number,
      name,
      category || 'room',
      max_guests || 2,
      price,
      description || null,
      JSON.stringify(imageArray)
    ]);

    res.json({ success: true, message: 'Room created!' });
  } catch (err) {
    console.error('CREATE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== UPDATE ROOM ====================
router.put('/update/:id', upload.array('images', 15), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, category_type, max_guests, price, description, deleteImages } = req.body;

    // Get current images
    const [current] = await pool.query('SELECT images FROM rooms WHERE id = ?', [id]);
    let images = [];
    if (current[0]?.images) {
      try { images = JSON.parse(current[0].images); }
      catch { images = []; }
    }

    // Delete selected old images
    if (deleteImages) {
      const toDelete = JSON.parse(deleteImages);
      images = images.filter(img => !toDelete.includes(path.basename(img)));

      toDelete.forEach(filename => {
        const filePath = path.join(__dirname, '../../public/uploads/rooms', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    // Add new images
    if (req.files?.length) {
      req.files.forEach(f => images.push('/uploads/rooms/' + f.filename));
    }

    await pool.query(`
      UPDATE rooms SET
        room_name = ?,
        room_type = ?,
        Category = ?,
        max_guests = ?,
        price = ?,
        room_description = ?,
        images = ?
      WHERE id = ?
    `, [
      name,
      category_type || 'room',
      category || 'room',
      max_guests || 2,
      price,
      description || null,
      JSON.stringify(images),
      id
    ]);

    res.json({ success: true, message: 'Room updated!' });
  } catch (err) {
    console.error('UPDATE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== DELETE ROOM ====================
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete images from server
    const [room] = await pool.query('SELECT images FROM rooms WHERE id = ?', [id]);
    if (room[0]?.images) {
      let images = [];
      try { images = JSON.parse(room[0].images); } catch {}
      images.forEach(img => {
        const filePath = path.join(__dirname, '../../public', img);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;