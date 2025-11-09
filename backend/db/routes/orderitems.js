const express = require('express');
const pool = require('../pool');
const router = express.Router();

// Insert new order item
router.post('/', async (req, res) => {
  const { orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings } = req.body;
  try {
    const next = await pool.query('SELECT COALESCE(MAX(orderitemid),0)+1 AS next FROM orderitem');
    const id = next.rows[0].next;
    await pool.query(
      'INSERT INTO orderitem (orderitemid,orderid,drinkid,quantity,price,icelevel,sugarlevel,toppings) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [id, orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings]
    );
    res.status(201).json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get order item details
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT o.*, m.drinkname FROM orderitem o
       JOIN menuitem m ON o.drinkid=m.drinkid WHERE o.orderitemid=$1`,
      [req.params.id]
    );
    res.json(r.rows[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete order item
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM orderitem WHERE orderitemid=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
