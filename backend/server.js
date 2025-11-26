// backend/server.js — FINAL NA TALAGA ‘TO, WALA NG ERROR!

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(session({
  secret: 'eduardos-resort-super-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,                    // ← false lang kapag localhost (http)
    httpOnly: true,                   // ← security: hindi maba-basa ng JS
    maxAge: 24 * 60 * 60 * 1000,      // 24 hours
    sameSite: 'lax'                   // ← GAMITIN MO ITO KAPAG SAME ORIGIN (recommended)
    // sameSite: 'none'                // ← gamitin lang kapag hiwalay ang frontend (React/Vite)
  }
}));

// SERVE STATIC FILES (images, css, js)
app.use(express.static(path.join(__dirname, '..', 'public')));

// ================= API ROUTES =================
// server.js — baguhin mo lang ‘to

const resortRoutes   = require('./routes/resort');
const contactRoutes  = require('./routes/contact');
const authRoutes     = require('./routes/auth');
//const productRoutes  = require('./routes/routes');

// Specific prefixes — walang conflict!
//app.use('/api/products', productRoutes);
app.use('/api/resort',   resortRoutes);     // ← bigyan ng sub-path
app.use('/api/contact',  contactRoutes);    // ← specific na rin
app.use('/api/auth',     authRoutes);// Same /api as resortRoutes

// ================= CLEAN URLS — SPECIFIC PAGES =================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/amenities', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'amenities.html'));
});

app.get('/rates', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'rates.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'gallery.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'contact.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'registration.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin-dashboard.html'));
});

// ================= CATCH-ALL — ISANG BESSES LANG, HULI TALAGA ‘TO! =================
// PALITAN MO MUNA ITO (temporary fix para makita natin kung sino talaga ang may sala)
app.get('/this-is-a-fake-path-that-will-never-be-hit-12345', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log('=====================================');
  console.log('EDUARDO\'S RESORT SERVER IS LIVE NA TALAGA!');
  console.log(`http://localhost:${PORT}`);
  console.log('Clean URLs: /amenities, /contact, /login, etc.');
  console.log('Contact form → saves to DB + sends email!');
  console.log('=====================================');
});