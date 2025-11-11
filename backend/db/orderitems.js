// backend/db/orderItems.js
const pool = require('./pool');

// Insert new order item
exports.insertOrderItem = async (orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings) => {
  const next = await pool.query('SELECT COALESCE(MAX(orderitemid),0)+1 AS next FROM orderitem');
  const id = next.rows[0].next;
  await pool.query(
    `INSERT INTO orderitem (orderitemid, orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings]
  );
  return id;
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
