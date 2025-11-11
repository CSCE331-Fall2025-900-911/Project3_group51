// backend/index.js

// 1. Load environment variables AT THE TOP from the correct path
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
// 2. dotenv.config() is already done, so this line is no longer needed
// require('dotenv').config(); 

const app = express();
const port = 3000;

// ... (rest of the file is the same) ...
app.use(cors());
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