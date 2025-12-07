const pool = require('./pool');

// Find customer by phone or email (case-insensitive for email). Returns first match.
async function findCustomer({ phone, email }) {
  const clauses = [];
  const params = [];

  if (phone) {
    clauses.push(`phone = $${params.length + 1}`);
    params.push(phone);
  }
  if (email) {
    clauses.push(`LOWER(email) = LOWER($${params.length + 1})`);
    params.push(email);
  }

  if (!clauses.length) return null;

  const sql = `
    SELECT id AS customerid, phone, email, COALESCE(points, 0) AS points
    FROM customers
    WHERE ${clauses.join(' OR ')}
    ORDER BY customerid
    LIMIT 1
  `;
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

// Create a new customer with provided contact info
async function createCustomer({ name, phone, email }) {
  const next = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next FROM customers');
  const id = next.rows[0].next;
  const phoneVal = phone ? parseInt(phone, 10) : null;

  await pool.query(
    `INSERT INTO customers (id, name, phone, email, points)
     VALUES ($1, $2, $3, $4, 0)`,
    [id, name || null, phoneVal, email || null]
  );

  return {
    customerid: id,
    name: name || null,
    phone: phoneVal || null,
    email: email || null,
    points: 0,
  };
}

// Ensure a customer exists and return their record
async function findOrCreateCustomer(contact) {
  const existing = await findCustomer(contact);
  if (existing) return existing;
  return createCustomer(contact);
}

async function getPoints(customerid) {
  const res = await pool.query(
    'SELECT COALESCE(points, 0) AS points FROM customers WHERE id = $1',
    [customerid]
  );
  return res.rows[0]?.points ?? 0;
}

// Apply a points delta: subtract used, add earned. Returns updated points balance.
async function applyPoints({ customerid, pointsUsed = 0, pointsEarned = 0 }, client = pool) {
  const res = await client.query(
    `UPDATE customers
     SET points = GREATEST(points - $1, 0) + $2
     WHERE id = $3
     RETURNING COALESCE(points, 0) AS points`,
    [pointsUsed, pointsEarned, customerid]
  );
  return res.rows[0]?.points ?? 0;
}

module.exports = {
  findOrCreateCustomer,
  findCustomer,
  createCustomer,
  getPoints,
  applyPoints,
};
