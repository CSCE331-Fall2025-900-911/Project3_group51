const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
