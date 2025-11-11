// backend/db/orders.js
const pool = require('./pool');

// Create new order
exports.createOrder = async (employeeid) => {
  const next = await pool.query('SELECT COALESCE(MAX(orderid),0)+1 AS next FROM orders');
  const id = next.rows[0].next;
  await pool.query(
    `INSERT INTO orders (orderid, customerid, employeeid, date, totalprice, orderstatus)
     VALUES ($1, 0, $2, NOW(), 0.0, 'Pending')`,
    [id, employeeid]
  );
  return id;
};

// Update entire order
exports.updateOrder = async (id, { customerid, employeeid, totalprice, orderstatus }) => {
  await pool.query(
    `UPDATE orders
     SET customerid=$1, employeeid=$2, totalprice=$3, orderstatus=$4, date=NOW()
     WHERE orderid=$5`,
    [customerid, employeeid, totalprice, orderstatus, id]
  );
};

// Update total only
exports.updateTotal = async (id, totalprice) => {
  await pool.query('UPDATE orders SET totalprice=$1 WHERE orderid=$2', [totalprice, id]);
};

// Get order items by order ID
exports.getOrderItems = async (id) => {
  const result = await pool.query(
    `SELECT o.orderitemid, o.orderid, o.drinkid, o.quantity, o.price,
            o.icelevel, o.sugarlevel, o.toppings, m.drinkname
     FROM orderitem o
     JOIN menuitem m ON o.drinkid = m.drinkid
     WHERE o.orderid = $1
     ORDER BY o.orderitemid`,
    [id]
  );
  return result.rows;
};

// Delete order and its items
exports.deleteOrder = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM orderitem WHERE orderid=$1', [id]);
    await client.query('DELETE FROM orders WHERE orderid=$1', [id]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
