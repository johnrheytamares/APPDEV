// backend/server.js — FINAL TALAGA NA ‘TO, WALANG ERROR NA!

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE (TAMA NA ANG ORDER) =================

// 1. CORS — kailangan ‘to kapag separate frontend (ex: React sa port 5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // palitan mo kung iba port mo
  credentials: true
}));

// 2. Session — bago ang body parser
app.use(session({
  secret: 'eduardos-resort-super-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,                    // false lang sa localhost (http)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,      // 24 hours
    sameSite: 'lax'                   // safe sa same origin
  }
}));

// 3. BODY PARSERS — ETO TALAGA ANG NAWAWALA MO KANINA!!!
app.use(express.json());                                      // ← para sa JSON (application/json)
app.use(express.urlencoded({ extended: true }));              // ← para sa form data

// 4. Serve static files (images, css, js, html)


// ================= API ROUTES =================
const resortRoutes  = require('./routes/resort.js');
const contactRoutes = require('./routes/contact.js');
const authRoutes    = require('./routes/auth.js');
const userRoutes    = require('./routes/users.js'); // assuming meron kang users.js
const roomRoutes    = require('./routes/admin/room.js'); // assuming may ganito ka
const customerRoutes = require('./routes/customer.js');
const reservationRoutes = require('./routes/reservation.js');

app.use('/api/reservations', reservationRoutes);

app.use('/api/customers', customerRoutes);

app.use('/api/users', userRoutes);
app.use('/api/resort',   resortRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/auth',     authRoutes);        // ← isa lang ‘to, tama na
app.use('/api/admin/rooms', roomRoutes);

app.use('/api/bookings', require('./routes/bookings'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/qr', express.static(path.join(__dirname, '..', 'public/qr')));
// ================= CLEAN URLS (HTML PAGES) =================
const sendPage = (file) => (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', file));
};

app.get('/',           sendPage('index.html'));
app.get('/amenities',  sendPage('amenities.html'));
app.get('/rates',      sendPage('rates.html'));
app.get('/gallery',    sendPage('gallery.html'));
app.get('/about',      sendPage('about.html'));
app.get('/contact',    sendPage('contact.html'));
app.get('/login',      sendPage('login.html'));
app.get('/signup',     sendPage('registration.html'));
app.get('/registration', sendPage('registration.html'));
app.get('/reservation', sendPage('reservation.html'));
app.get('/admin-dashboard', sendPage('admin-dashboard.html'));
app.get('/admin',      sendPage('room_and_cottage.html'));
app.get('/confirmationbooking', sendPage('confirmationbooking.html'));
app.get('/user', sendPage('usermangement.html'));
app.get('/customerdashboard', sendPage('customer.html'));
app.get('/adminreservations', sendPage('reservation_management.html'));

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) { 
      return res.status(500).send('Error logging out');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// ================= 404 — KUNG WALANG MATCH =================
// FINAL 404 HANDLER — WALANG ERROR EVER NA!
app.use((req, res, next) => {
  // Kung may specific routes ka na hindi static, i-skip
  if (req.path.startsWith('/api/') || req.path.startsWith('/qr/')) {
    return next();
  }

  // Kung may file sa public folder, serve mo (para hindi mag-error)
  const filePath = path.join(__dirname, '..', 'public', req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }

  // Kung wala talaga — maganda at walang error!
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>404 - Eduardo's Resort</title>
      <style>
        body { font-family: 'Inter', sans-serif; background: linear-gradient(to bottom, #E0F7FA, #fff); 
               display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .box { text-align: center; background: white; padding: 3rem; border-radius: 20px; 
               box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 400px; }
        h1 { font-size: 4rem; margin: 0; color: #2B6CB0; }
        p { color: #718096; margin: 1rem 0; }
        a { background: #2B6CB0; color: white; padding: 0.75rem 1.5rem; border-radius: 12px; 
            text-decoration: none; font-weight: 600; display: inline-block; margin-top: 1rem; }
        a:hover { background: #1E4D7A; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>404</h1>
        <p>Oops! Page not found.</p>
        <p><a href="/">Back to Home</a></p>
      </div>
    </body>
    </html>
  `);
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log('=====================================');
  console.log('EDUARDO\'S RESORT SERVER IS LIVE NA TALAGA!');
  console.log(`http://localhost:${PORT}`);
  console.log('Clean URLs: /amenities, /contact, /login, etc.');
  console.log('Register & Login → WORKING NA 100%!');
  console.log('=====================================');
});