// backend/routes/admin/rooms.js
const express = require("express");
const router = express.Router();
const pool = require("../../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup upload destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/images/rooms/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET all room types with images
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT rt.*, ri.id AS img_id, ri.image_url, ri.is_primary, ri.sort_order
      FROM room_types rt
      LEFT JOIN room_images ri ON rt.id = ri.room_type_id
      ORDER BY rt.id DESC, ri.sort_order ASC
    `);

    const rooms = [];
    rows.forEach(r => {
      const existing = rooms.find(x => x.id === r.id);
      if (existing) {
        if (r.image_url) {
          existing.images.push({
            id: r.img_id,
            url: r.image_url,
            is_primary: r.is_primary,
            sort_order: r.sort_order
          });
        }
      } else {
        rooms.push({
          id: r.id,
          code: r.code,
          name: r.name,
          slug: r.slug,
          category: r.category,
          price: parseFloat(r.price),
          original_price: r.original_price ? parseFloat(r.original_price) : null,
          max_guests: r.max_guests,
          per_night: r.per_night,
          description: r.description,
          images: r.image_url ? [{
            id: r.img_id,
            url: r.image_url,
            is_primary: r.is_primary,
            sort_order: r.sort_order
          }] : []
        });
      }
    });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// CREATE room type
router.post("/", upload.array("images", 12), async (req, res) => {
  const { name, category, price, original_price, max_guests, description } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO room_types 
       (code, name, slug, category, price, original_price, max_guests, description, per_night)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        "RT" + Date.now().toString().slice(-6),
        name,
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category || "room",
        price,
        original_price || null,
        max_guests || 2,
        description || null
      ]
    );

    const roomId = result.insertId;

    if (req.files?.length) {
      for (const [i, file] of req.files.entries()) {
        const imgUrl = `/images/rooms/${file.filename}`;
        await pool.query(
          `INSERT INTO room_images (room_type_id, image_url, alt_text, is_primary, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [roomId, imgUrl, `${name} - Image ${i+1}`, i === 0 ? 1 : 0, i]
        );
      }
    }

    res.json({ success: true, roomId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE room type
router.put("/:id", upload.array("images", 12), async (req, res) => {
  const roomId = req.params.id;
  const { name, category, price, original_price, max_guests, description, delete_images } = req.body;

  try {
    await pool.query(
      `UPDATE room_types SET 
         name = ?, slug = ?, category = ?, price = ?, original_price = ?, max_guests = ?, description = ?
       WHERE id = ?`,
      [
        name,
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category || "room",
        price,
        original_price || null,
        max_guests || 2,
        description || null,
        roomId
      ]
    );

    // Delete selected images
    if (delete_images) {
      const ids = JSON.parse(delete_images);
      if (ids.length > 0) {
        const [imgs] = await pool.query("SELECT image_url FROM room_images WHERE id IN (?)", [ids]);
        await pool.query("DELETE FROM room_images WHERE id IN (?)", [ids]);
        imgs.forEach(img => {
          const fullPath = path.join(__dirname, "../../public", img.image_url);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });
      }
    }

    // Add new images
    if (req.files?.length) {
      for (const [i, file] of req.files.entries()) {
        const imgUrl = `/images/rooms/${file.filename}`;
        await pool.query(
          `INSERT INTO room_images (room_type_id, image_url, alt_text, is_primary, sort_order)
           VALUES (?, ?, ?, 0, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM room_images WHERE room_type_id = ?))`,
          [roomId, imgUrl, `${name} - New Image`, roomId]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE room type
router.delete("/:id", async (req, res) => {
  try {
    const [imgs] = await pool.query("SELECT image_url FROM room_images WHERE room_type_id = ?", [req.params.id]);
    await pool.query("DELETE FROM room_types WHERE id = ?", [req.params.id]);
    await pool.query("DELETE FROM room_images WHERE room_type_id = ?", [req.params.id]);

    imgs.forEach(img => {
      const fullPath = path.join(__dirname, "../../public", img.image_url);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;