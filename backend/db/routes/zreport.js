const express = require('express');
const pool = require('../pool');
const router = express.Router();
const TAX_RATE = 0.0825;

// Create table
router.post('/createTable', async (_, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS z_report_log (
      report_id SERIAL PRIMARY KEY,
      report_date DATE NOT NULL UNIQUE,
      total_sales REAL NOT NULL,
      total_voids REAL DEFAULT 0,
      calculated_tax REAL DEFAULT 0,
      generated_by VARCHAR(255)
    )`;
  try {
    await pool.query(sql);
    // Ensure newer columns exist if table was created previously
    await pool.query(`ALTER TABLE z_report_log ADD COLUMN IF NOT EXISTS total_voids REAL DEFAULT 0`);
    await pool.query(`ALTER TABLE z_report_log ADD COLUMN IF NOT EXISTS calculated_tax REAL DEFAULT 0`);
    await pool.query(`ALTER TABLE z_report_log ADD COLUMN IF NOT EXISTS generated_by VARCHAR(255)`);
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
router.post('/generate', async (req, res) => {
  const today = new Date();
  const start = new Date(today.setHours(0,0,0,0));
  const startDateStr = start.toISOString().slice(0, 10); // YYYY-MM-DD
  const end = new Date(start.getTime() + 86400000);
  try {
    const check = await pool.query('SELECT 1 FROM z_report_log WHERE report_date=$1::date', [startDateStr]);
    if (check.rowCount) return res.status(409).json({ message: 'Already exists' });

    const sales = await pool.query(
      'SELECT SUM(totalprice) AS daily_total FROM orders WHERE date >= $1 AND date < $2',
      [start, end]
    );
    const base = await pool.query(
      'SELECT COALESCE(SUM(price * quantity),0) AS base_total FROM orderitem oi JOIN orders o ON oi.orderid = o.orderid WHERE o.date >= $1 AND o.date < $2',
      [start, end]
    );
    const total = parseFloat(sales.rows[0].daily_total || 0);
    const calculatedTax = parseFloat(base.rows[0].base_total || 0) * TAX_RATE;

    let generatedBy = req.body?.generatedBy || null;
    const emailFromBody = req.body?.generatedByEmail || null;
    let email = emailFromBody || req.user?.email || req.user?.Email || null;

    if (!generatedBy && email) {
      try {
        const emp = await pool.query(
          'SELECT firstname, lastname FROM employees WHERE email ILIKE $1 LIMIT 1',
          [email]
        );
        if (emp.rowCount) {
          const row = emp.rows[0];
          generatedBy = [row.firstname, row.lastname].filter(Boolean).join(' ').trim();
        }
      } catch (e) {
        // ignore lookup failure, fallback below
      }
    }
    if (!generatedBy) {
      generatedBy =
        req.user?.firstname ||
        req.user?.firstName ||
        req.user?.name ||
        'System';
    }
    await pool.query(
      'INSERT INTO z_report_log (report_date,total_sales,total_voids,calculated_tax,generated_by) VALUES ($1::date,$2,$3,$4,$5)',
      [startDateStr, total, 0, calculatedTax, generatedBy]
    );
    res.json({ date: startDateStr, total, generatedBy, calculatedTax });
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

// On-demand Z-report summary (today's totals, no persistence required)
router.get('/summary', async (_req, res) => {
  try {
    const today = new Date();
    const start = new Date(today.setHours(0,0,0,0));
    const startDateStr = start.toISOString().slice(0, 10);
    // If a report was generated today, return it; otherwise return live preview
    const existing = await pool.query(
      `SELECT report_date,
              total_sales,
              COALESCE(total_voids,0) AS total_voids,
              COALESCE(calculated_tax,0) AS calculated_tax,
              COALESCE(generated_by,'System') AS generated_by
       FROM z_report_log
       WHERE report_date = $1::date`,
      [startDateStr]
    );
    if (existing.rowCount) {
      const row = existing.rows[0];
      return res.json({
        reportDate: row.report_date,
        totalSales: parseFloat(row.total_sales ?? 0),
        totalAmountVoided: parseFloat(row.total_voids ?? 0),
        totalCalculatedTax: parseFloat(row.calculated_tax ?? 0),
        generatedByEmployeeName: row.generated_by || "System",
      });
    }
    // No stored report yet for today; return blanks
    res.json({
      reportDate: null,
      totalSales: null,
      totalAmountVoided: null,
      totalCalculatedTax: null,
      generatedByEmployeeName: null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
