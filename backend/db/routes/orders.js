const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
  const { employeeid } = req.body;
  try {
    const next = await pool.query('SELECT COALESCE(MAX(orderid),0)+1 AS next FROM orders');
    const id = next.rows[0].next;
    await pool.query(
      'INSERT INTO orders (orderid, customerid, employeeid, date, totalprice, orderstatus) VALUES ($1,0,$2,NOW(),0.0,\'Pending\')',
      [id, employeeid]
    );
    res.status(201).json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update order
router.put('/:id', async (req, res) => {
  const { customerid, employeeid, totalprice, orderstatus } = req.body;
  try {
    await pool.query(
      'UPDATE orders SET customerid=$1, employeeid=$2, totalprice=$3, orderstatus=$4, date=NOW() WHERE orderid=$5',
      [customerid, employeeid, totalprice, orderstatus, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update total
router.put('/:id/total', async (req, res) => {
  const { totalprice } = req.body;
  try {
    await pool.query('UPDATE orders SET totalprice=$1 WHERE orderid=$2', [totalprice, req.params.id]);
    res.json({ message: 'Total updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get items by order ID
router.get('/:id/items', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT o.orderitemid,o.orderid,o.drinkid,o.quantity,o.price,
              o.icelevel,o.sugarlevel,o.toppings,m.drinkname
       FROM orderitem o JOIN menuitem m ON o.drinkid=m.drinkid
       WHERE o.orderid=$1 ORDER BY o.orderitemid`, [req.params.id]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete order and items
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM orderitem WHERE orderid=$1', [req.params.id]);
    await client.query('DELETE FROM orders WHERE orderid=$1', [req.params.id]);
    await client.query('COMMIT');
    res.json({ message: 'Order deleted' });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

module.exports = router;
