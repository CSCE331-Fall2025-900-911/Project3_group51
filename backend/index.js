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

// Create express app
const app = express();
const port = 3000;
app.use(cors());

// Create pool
const pool = new Pool({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    ssl: {rejectUnauthorized: false}
});

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
