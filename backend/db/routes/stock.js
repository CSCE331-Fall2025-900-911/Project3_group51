const express = require('express');
const pool = require('../pool');
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

// Upsert by drinkid (create if missing, otherwise update)
router.put('/drink/:drinkid', async (req, res) => {
  const drinkid = Number(req.params.drinkid);
  const { quantity = 0, restock_date = null, alert_level = null } = req.body || {};
  if (Number.isNaN(drinkid)) return res.status(400).json({ error: 'Invalid drinkid' });
  try {
    const existing = await pool.query('SELECT stockid FROM stock WHERE drinkid=$1', [drinkid]);
    let stockid;
    if (existing.rowCount) {
      stockid = existing.rows[0].stockid;
      await pool.query(
        'UPDATE stock SET quantity=$1, restock_date=$2, alert_level=COALESCE($3, alert_level) WHERE drinkid=$4',
        [quantity, restock_date, alert_level, drinkid]
      );
    } else {
      const next = await pool.query('SELECT COALESCE(MAX(stockid),0)+1 AS next FROM stock');
      stockid = next.rows[0].next;
      await pool.query(
        'INSERT INTO stock (stockid, drinkid, quantity, restock_date, alert_level) VALUES ($1,$2,$3,$4,$5)',
        [stockid, drinkid, quantity, restock_date, alert_level ?? 5]
      );
    }
    res.json({ stockid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
