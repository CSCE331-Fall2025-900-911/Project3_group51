import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

import menuRoutes from './routers/menuRoutes.js'

// Create express app
const app = express();
const port = 3000;

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

// Home page: adjust here show the image of weather, and a button direct to order page
app.get('/', (req, res) => {
    const data = {name: 'Thien'};
    res.render('index', data);
});

// Routers

// Menu API
app.use('/api/menu', menuRoutes);

// // Order API
// app.use('/api/orders', orderRoutes);

// // Payment API
// app.use('/api/payemnt', paymentRoutes);

// // Management API
// app.use("/api/management", managementRoutes);

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
    console.log(`Example app listening at http://localhost:${port}`);
});
