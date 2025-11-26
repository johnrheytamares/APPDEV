// // test-server.js — ITO NA TALAGA ANG GUMAGANA, WALANG ERROR!

// const express = require('express');
// const cors = require('cors');
// const path = require('path');

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// console.log('Loading routes...');

// try {
//   const productRoutes = require('./routes/routes');
//   app.use('/api/products', productRoutes);
//   console.log('Products route loaded');
// } catch (e) {
//   console.log('Error loading products:', e.message);
// }

// try {
//   const resortRoutes = require('./routes/resort');
//   app.use('/api', resortRoutes);
//   console.log('Chatbot route loaded');
// } catch (e) {
//   console.log('Error loading resort:', e.message);
// }

// // PINAKABABA TALAGA ANG *
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.listen(PORT, () => {
//   console.log('=====================================');
//   console.log('GUMANA NA TALAGA BRO!');
//   console.log('http://localhost:5000');
//   console.log('=====================================');
// });