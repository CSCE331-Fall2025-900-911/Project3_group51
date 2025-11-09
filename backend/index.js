const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });


const app = express();
const port = 3000;
app.use(cors());

app.use(cors());
app.use(express.json());

// Import routes
app.use('/api/employees', require('./db/routes/employees'));
app.use('/api/menu', require('./db/routes/menu'));
app.use('/api/orders', require('./db/routes/orders'));
app.use('/api/orderitems', require('./db/routes/orderitems'));
app.use('/api/stock', require('./db/routes/stock'));
app.use('/api/reports', require('./db/routes/reports'));
app.use('/api/zreport', require('./db/routes/zreport'));

app.get('/', (_, res) => res.send('POS API running'));

app.listen(port, () => console.log(`Server running on port ${port}`));
