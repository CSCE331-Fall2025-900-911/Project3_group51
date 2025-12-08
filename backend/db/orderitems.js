// backend/db/orderitems.js
const pool = require('./pool');

// Insert new order item and decrement stock
exports.insertOrderItem = async (orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings, comments, size, temperature) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const stockRes = await client.query(
      'SELECT stockid, quantity FROM stock WHERE drinkid = $1 FOR UPDATE',
      [drinkid]
    );
    const available = stockRes.rows[0]?.quantity ?? 0;
    if (available < quantity) {
      const err = new Error('INSUFFICIENT_STOCK');
      err.code = 'INSUFFICIENT_STOCK';
      throw err;
    }

    const next = await client.query('SELECT COALESCE(MAX(orderitemid),0)+1 AS next FROM orderitem');
    const id = next.rows[0].next;
    const trimmedComments = comments ? comments.toString().slice(0, 255) : null;

    await client.query(
      `INSERT INTO orderitem (orderitemid, orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings, comments, size, temperature)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings, trimmedComments, size, temperature]
    );

    await client.query(
      'UPDATE stock SET quantity = quantity - $1 WHERE drinkid = $2',
      [quantity, drinkid]
    );

    await client.query('COMMIT');
    return id;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

// Get order item by ID
exports.getOrderItemById = async (id) => {
  const result = await pool.query(
    `SELECT o.*, m.drinkname
     FROM orderitem o
     JOIN menuitem m ON o.drinkid = m.drinkid
     WHERE o.orderitemid = $1`,
    [id]
  );
  return result.rows[0] || null;
};

// Delete order item
exports.deleteOrderItem = async (id) => {
  await pool.query('DELETE FROM orderitem WHERE orderitemid=$1', [id]);
};