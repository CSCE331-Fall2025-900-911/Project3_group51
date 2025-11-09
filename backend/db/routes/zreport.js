const express = require('express');
const pool = require('../pool');
const router = express.Router();

// Create table
router.post('/createTable', async (_, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS z_report_log (
      report_id SERIAL PRIMARY KEY,
      report_date DATE NOT NULL UNIQUE,
      total_sales REAL NOT NULL
    )`;
  try {
    await pool.query(sql);
    res.json({ message: 'Table ready' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Last Z-Report date
router.get('/lastDate', async (_, res) => {
  try {
    const r = await pool.query('SELECT MAX(report_date) AS last FROM z_report_log');
    res.json({ lastDate: r.rows[0].last });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Today's Z-Report
router.get('/today', async (_, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const r = await pool.query('SELECT * FROM z_report_log WHERE report_date=$1', [today]);
    res.json(r.rows[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Generate new Z-Report
router.post('/generate', async (_, res) => {
  const today = new Date();
  const start = new Date(today.setHours(0,0,0,0));
  const end = new Date(start.getTime() + 86400000);
  try {
    const check = await pool.query('SELECT 1 FROM z_report_log WHERE report_date=$1', [start]);
    if (check.rowCount) return res.status(409).json({ message: 'Already exists' });

    const sales = await pool.query(
      'SELECT SUM(totalprice) AS daily_total FROM orders WHERE date >= $1 AND date < $2',
      [start, end]
    );
    const total = parseFloat(sales.rows[0].daily_total || 0);
    await pool.query('INSERT INTO z_report_log (report_date,total_sales) VALUES ($1,$2)', [start, total]);
    res.json({ date: start, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete today's report
router.delete('/today', async (_, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    await pool.query('DELETE FROM z_report_log WHERE report_date=$1', [today]);
    res.json({ message: 'Deleted today\'s Z-report' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
