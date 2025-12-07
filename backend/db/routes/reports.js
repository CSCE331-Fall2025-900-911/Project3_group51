// backend/db/routes/reports.js
const express = require('express');
const pool = require('../pool');
const router = express.Router();

/**
 * SALES REPORT
 * GET /api/reports/sales?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
router.get('/sales', async (req, res) => {
  const { start, end } = req.query;
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  try {
    const r = await pool.query(
      `SELECT m.drinkname,
              SUM(oi.quantity) AS total_quantity,
              SUM(oi.price)    AS total_sales
       FROM orderitem oi
       JOIN menuitem m ON oi.drinkid = m.drinkid
       JOIN orders   o ON oi.orderid = o.orderid
       WHERE ($1::date IS NULL OR o.date >= $1::date)
         AND ($2::date IS NULL OR o.date < ($2::date + INTERVAL '1 day'))
       GROUP BY m.drinkname
       ORDER BY total_sales DESC`,
      [startDate, endDate]
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * PRODUCT USAGE REPORT
 * GET /api/reports/usage?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
router.get('/usage', async (req, res) => {
  const { start, end } = req.query;
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  try {
    const r = await pool.query(
      `SELECT mi.drinkid,
              mi.drinkname,
              SUM(oi.quantity) AS total_used
       FROM orderitem oi
       JOIN orders   o  ON oi.orderid = o.orderid
       JOIN menuitem mi ON oi.drinkid = mi.drinkid
       WHERE ($1::date IS NULL OR o.date >= $1::date)
         AND ($2::date IS NULL OR o.date < ($2::date + INTERVAL '1 day'))
       GROUP BY mi.drinkid, mi.drinkname
       ORDER BY total_used DESC`,
      [startDate, endDate]
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * HOURLY SALES
 * GET /api/reports/hourly?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
router.get('/hourly', async (req, res) => {
  const { start, end } = req.query;
  const startDate = start ? new Date(start) : new Date(); // default to today if not provided
  const endDate = end ? new Date(end) : startDate;
  try {
    const r = await pool.query(
      `
        WITH bounds AS (
          SELECT $1::date AS start_date, $2::date AS end_date
        ),
        hours AS (
          -- business hours 10:00 through 22:00 (10 AM to 10 PM)
          SELECT generate_series(10, 22) AS hr
        ),
        summed AS (
          SELECT
            DATE_PART('hour', o.date) AS hr,
            COALESCE(SUM(oi.price), 0) AS sales
          FROM orders o
          LEFT JOIN orderitem oi ON oi.orderid = o.orderid
          CROSS JOIN bounds b
          WHERE o.date >= b.start_date
            AND o.date < (b.end_date + INTERVAL '1 day')
          GROUP BY hr
        )
        SELECT
          TO_CHAR(make_time(hours.hr, 0, 0), 'HH24:MI') AS hour_label,
          COALESCE(summed.sales, 0) AS sales
        FROM hours
        LEFT JOIN summed ON summed.hr = hours.hr
        ORDER BY hours.hr ASC
      `,
      [startDate, endDate]
    );

    const rows = r.rows.map(row => ({
      hour: row.hour_label,
      sales: parseFloat(row.sales)
    }));

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * INVENTORY SNAPSHOT FOR INVENTORY SCREEN
 * GET /api/reports/inventory
 *
 * Joins stock + menuitem so the frontend gets:
 *  - itemname
 *  - qty
 *  - threshold
 */
router.get('/inventory', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT
         mi.drinkid,
         s.stockid,
         COALESCE(mi.drinkname, 'Item ' || mi.drinkid::text) AS itemname,
         COALESCE(s.quantity, 0) AS qty,
         COALESCE(s.alert_level, 0) AS threshold,
         s.restock_date
       FROM menuitem mi
       LEFT JOIN stock s ON s.drinkid = mi.drinkid
       ORDER BY mi.drinkname`
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * ORDERING TRENDS FOR TRENDS SCREEN
 * GET /api/reports/trends
 *
 * Returns items with total quantity ordered:
 *  [
 *    { itemname: "Thai Tea", qty: 42 },
 *    { itemname: "Brown Sugar Boba", qty: 35 },
 *    ...
 *  ]
 */
router.get('/trends', async (req, res) => {
  const { start, end } = req.query;
  try {
    const r = await pool.query(
      `SELECT
         m.drinkname AS itemname,
         SUM(oi.quantity) AS qty
       FROM orderitem oi
       JOIN menuitem m ON oi.drinkid = m.drinkid
       JOIN orders   o ON oi.orderid = o.orderid
       WHERE ($1::date IS NULL OR o.date >= $1::date)
         AND ($2::date IS NULL OR o.date < ($2::date + INTERVAL '1 day'))
       GROUP BY m.drinkname
       ORDER BY qty DESC`,
      [start || null, end || null]
    );

    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * RECENT ORDER ITEMS
 * GET /api/reports/recent-orderitems?limit=50
 */
router.get('/recent-orderitems', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  try {
    const r = await pool.query(
      `SELECT
         oi.orderitemid,
         oi.orderid,
         oi.quantity,
         oi.price,
         oi.comments,
         o.date,
         m.drinkname
       FROM orderitem oi
       JOIN orders o ON oi.orderid = o.orderid
       JOIN menuitem m ON oi.drinkid = m.drinkid
       ORDER BY o.date DESC, oi.orderitemid DESC
       LIMIT $1`,
      [limit]
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
