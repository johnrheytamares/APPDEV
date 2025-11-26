require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/product');
const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.send({ message: 'API running...' }));
app.use('/api/products', usersRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running at 
http://localhost:${PORT}`));