const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// Validate employee
router.get('/validate', async (req, res) => {
  const { first, last } = req.query;
  try {
    const result = await pool.query(
      'SELECT 1 FROM employees WHERE firstname=$1 AND lastname=$2 LIMIT 1',
      [first, last]
    );
    res.json({ exists: result.rowCount > 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get role
router.get('/role', async (req, res) => {
  const { first, last, ci } = req.query;
  const sql = ci === 'true'
    ? 'SELECT role FROM employees WHERE LOWER(firstname)=LOWER($1) AND LOWER(lastname)=LOWER($2) LIMIT 1'
    : 'SELECT role FROM employees WHERE firstname=$1 AND lastname=$2 LIMIT 1';
  try {
    const result = await pool.query(sql, [first, last]);
    res.json({ role: result.rows[0]?.role || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// All employees
router.get('/', async (_, res) => {
  try {
    const result = await pool.query(
      'SELECT employeeid, firstname, lastname, role FROM employees ORDER BY employeeid'
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add employee
router.post('/', async (req, res) => {
  const { firstname, lastname, role } = req.body;
  try {
    const next = await pool.query('SELECT COALESCE(MAX(employeeid),0)+1 AS next FROM employees');
    const id = next.rows[0].next;
    await pool.query(
      'INSERT INTO employees (employeeid, firstname, lastname, role) VALUES ($1,$2,$3,$4::role_type)',
      [id, firstname, lastname, role]
    );
    res.status(201).json({ id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update
router.put('/:id', async (req, res) => {
  const { id } = req.params, { firstname, lastname, role } = req.body;
  try {
    await pool.query(
      'UPDATE employees SET firstname=$1, lastname=$2, role=$3::role_type WHERE employeeid=$4',
      [firstname, lastname, role, id]
    );
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE employeeid=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT firstname, lastname FROM employees WHERE employeeid=$1', [req.params.id]);
    res.json(r.rows[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get ID by name
router.get('/id/:name', async (req, res) => {
  const name = req.params.name;
  try {
    const r = await pool.query(
      'SELECT employeeid FROM employees WHERE firstname=INITCAP($1) LIMIT 1',
      [name.toLowerCase()]
    );
    res.json({ id: r.rows[0]?.employeeid ?? -1 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
