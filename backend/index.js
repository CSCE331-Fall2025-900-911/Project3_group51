const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Import routes
app.use('/api/employees', require('./routes/employees'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/orderitems', require('./routes/orderitems'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/zreport', require('./routes/zreport'));

app.get('/', (_, res) => res.send('POS API running'));

app.listen(port, () => console.log(`Server running on port ${port}`));
