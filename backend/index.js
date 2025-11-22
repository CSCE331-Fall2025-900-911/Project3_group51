// backend/index.js

// 1. Load environment variables AT THE TOP from the correct path
// require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');     
require('./auth/passport-setup');

const app = express();
const port = 3000;

// ... (rest of the file is the same) ...
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://project3-group51-frontend.onrender.com' 
  ],
  credentials: true 
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true 
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Import routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./db/routes/employees'));
app.use('/api/menu', require('./db/routes/menu'));
app.use('/api/orders', require('./routes/orderRoutes')); // Use the new controller/routes structure
app.use('/api/orderitems', require('./routes/orderItemsRoutes')); // Use the new controller/routes structure
app.use('/api/translate', require('./routes/translateRoutes')) // backend translation API
app.use('/api/stock', require('./db/routes/stock'));
app.use('/api/reports', require('./db/routes/reports'));
app.use('/api/zreport', require('./db/routes/zreport'));


app.get('/', (_, res) => res.send('POS API running'));

app.listen(port, () => console.log(`Server running on port ${port}`));