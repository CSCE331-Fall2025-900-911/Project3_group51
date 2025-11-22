const express = require('express');
const pool = require('../pool');
const router = express.Router();

// Validate employee (case-insensitive)
router.get('/validate', async (req, res) => {
  const { first, last } = req.query;
  try {
    const result = await pool.query(
      'SELECT 1 FROM employees WHERE firstname ILIKE $1 AND lastname ILIKE $2 LIMIT 1',
      [first, last]
    );
    res.json({ exists: result.rowCount > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get role (case-insensitive always)
router.get('/role', async (req, res) => {
  const { first, last } = req.query;
  try {
    const result = await pool.query(
      'SELECT role FROM employees WHERE firstname ILIKE $1 AND lastname ILIKE $2 LIMIT 1',
      [first, last]
    );
    res.json({ role: result.rows[0]?.role || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All employees
router.get('/', async (_, res) => {
  try {
    const result = await pool.query(
      'SELECT employeeid, firstname, lastname, role, email FROM employees ORDER BY employeeid'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add employee
router.post('/', async (req, res) => {
  const { firstname, lastname, role, email } = req.body;
  try {
    const next = await pool.query('SELECT COALESCE(MAX(employeeid),0)+1 AS next FROM employees');
    const id = next.rows[0].next;
    await pool.query(
      'INSERT INTO employees (employeeid, firstname, lastname, role, email) VALUES ($1,$2,$3,$4::role_type,$5)',
      [id, firstname, lastname, role, email]
    );
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  const { id } = req.params, { firstname, lastname, role, email } = req.body;
  try {
    await pool.query(
      'UPDATE employees SET firstname=$1, lastname=$2, role=$3::role_type, email=$4 WHERE employeeid=$5',
      [firstname, lastname, role, email, id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE employeeid=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT firstname, lastname, email FROM employees WHERE employeeid=$1', [req.params.id]);
    res.json(r.rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get ID by name
router.get('/id/:name', async (req, res) => {
  const name = req.params.name;
  try {
    const r = await pool.query(
      'SELECT employeeid FROM employees WHERE firstname ILIKE $1 LIMIT 1',
      [name]
    );
    res.json({ id: r.rows[0]?.employeeid ?? -1 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
