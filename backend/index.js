<<<<<<< HEAD
import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
import cors from "cors";

import homeRoutes from './routers/homeRoutes.js';
import menuRoutes from './routers/menuRoutes.js';
import orderRoutes from './routers/orderRoutes.js';
import checkoutRoutes from './routers/checkoutRoutes.js';
import managementRoutes from './routers/managementRoutes.js';

const { Pool } = pkg;

dotenv.config();
=======
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

>>>>>>> main

const app = express();
const port = 3000;
app.use(cors());

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Add process hook to shutdown pool                  
process.on('SIGINT', function() {
    pool.end();
    console.log('Application successfully shutdown');
    process.exit(0);
});
	 	 	 	
app.set("view engine", "ejs");


// Routers

// Home 
app.use('/api/home', homeRoutes);

// Menu
app.use('/api/menu', menuRoutes);

// Order
app.use('/api/orders', orderRoutes);

// Payment
app.use('/api/checkout', checkoutRoutes);

// Management
app.use("/api/management", managementRoutes);

// Testing page
app.get('/user', (req, res) => {
    teammembers = []
    pool
        .query('SELECT * FROM employees;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                teammembers.push(query_res.rows[i]);
            }
            const data = {teammembers: teammembers};
            console.log(teammembers);
            res.render('user', data);
        });
});

app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});
=======
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
>>>>>>> main
