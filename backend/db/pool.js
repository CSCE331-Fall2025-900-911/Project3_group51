// db/pool.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT,
  ssl: { rejectUnauthorized: false },
});

process.on('SIGINT', async () => {
  await pool.end();
  console.log('DB pool closed.');
  process.exit(0);
});

module.exports = pool;
