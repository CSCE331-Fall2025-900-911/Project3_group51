const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// All stock
router.get('/', async (_, res) => {
  try {
    const r = await pool.query('SELECT * FROM stock ORDER BY stockid');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update quantity/date
router.put('/:id/quantity', async (req, res) => {
  const { quantity, restock_date } = req.body;
  try {
    await pool.query('UPDATE stock SET quantity=$1, restock_date=$2 WHERE stockid=$3',
      [quantity, restock_date, req.params.id]);
    res.json({ message: 'Quantity updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update alert level
router.put('/:id/alert', async (req, res) => {
  try {
    await pool.query('UPDATE stock SET alert_level=$1 WHERE stockid=$2',
      [req.body.alert_level, req.params.id]);
    res.json({ message: 'Alert level updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
