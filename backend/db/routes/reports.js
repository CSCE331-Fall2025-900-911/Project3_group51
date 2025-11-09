const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// Sales report
router.get('/sales', async (req, res) => {
  const { start, end } = req.query;
  const endNext = new Date(new Date(end).getTime() + 86400000); // +1 day
  try {
    const r = await pool.query(
      `SELECT m.drinkname, SUM(oi.quantity) AS total_quantity, SUM(oi.price) AS total_sales
       FROM orderitem oi
       JOIN menuitem m ON oi.drinkid=m.drinkid
       JOIN orders o ON oi.orderid=o.orderid
       WHERE o.date >= $1 AND o.date < $2
       GROUP BY m.drinkname ORDER BY total_sales DESC`,
      [start, endNext]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Product usage
router.get('/usage', async (req, res) => {
  const { start, end } = req.query;
  const endNext = new Date(new Date(end).getTime() + 86400000);
  try {
    const r = await pool.query(
      `SELECT s.drinkid, SUM(oi.quantity) AS total_used
       FROM orderitem oi
       JOIN orders o ON oi.orderid=o.orderid
       JOIN menuitem mi ON oi.drinkid=mi.drinkid
       JOIN stock s ON mi.ingredient=s.drinkid
       WHERE o.date >= $1 AND o.date < $2
       GROUP BY s.drinkid ORDER BY total_used DESC`,
      [start, endNext]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Hourly sales
router.get('/hourly', async (req, res) => {
  const { day } = req.query;
  const start = new Date(day);
  const end = new Date(start.getTime() + 86400000);
  try {
    const r = await pool.query(
      `SELECT DATE_TRUNC('hour', o.date) AS hr,
              COUNT(DISTINCT o.orderid) AS orders,
              COALESCE(SUM(oi.price),0) AS sales
       FROM orders o LEFT JOIN orderitem oi ON oi.orderid=o.orderid
       WHERE o.date >= $1 AND o.date < $2
       GROUP BY hr ORDER BY hr ASC`, [start, end]
    );
    const rows = r.rows.map(row => ({
      hour: new Date(row.hr).getHours().toString().padStart(2, '0') + ':00',
      orders: row.orders,
      sales: parseFloat(row.sales)
    }));
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
