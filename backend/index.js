// backend/index.js

// 2. dotenv.config() is already done, so this line is no longer needed
require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',                  // local dev
  process.env.FRONTEND_PRODUCTION_URL // production frontend from .env
];


const app = express();
const port = process.env.PORT || 3000;

// Set up cors policy
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow requests with no origin
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Import routes
app.use('/api/employees', require('./db/routes/employees'));
app.use('/api/menu', require('./db/routes/menu'));
app.use('/api/orders', require('./routes/orderRoutes')); // Use the new controller/routes structure
app.use('/api/orderitems', require('./routes/orderItemsRoutes')); // Use the new controller/routes structure
app.use('/api/stock', require('./db/routes/stock'));
app.use('/api/reports', require('./db/routes/reports'));
app.use('/api/zreport', require('./db/routes/zreport'));

app.get('/', (_, res) => res.send('POS API running'));

app.listen(port, () => console.log(`Server running on port ${port}`));