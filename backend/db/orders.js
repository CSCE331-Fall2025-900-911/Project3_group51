// backend/db/orders.js
const pool = require('./pool');

const customers = require('./customers');

// Create new order
exports.createOrder = async (employeeid, customerid = null) => {
  const next = await pool.query('SELECT COALESCE(MAX(orderid),0)+1 AS next FROM orders');
  const id = next.rows[0].next;
  await pool.query(
    `INSERT INTO orders (orderid, customerid, employeeid, date, totalprice, orderstatus)
     VALUES ($1, $2, $3, (NOW() AT TIME ZONE 'America/Chicago'), 0.0, 'Pending')`,
    [id, customerid ?? null, employeeid]
  );
  return id;
};

// Update entire order
exports.updateOrder = async (id, { customerid, employeeid, totalprice, orderstatus }) => {
  await pool.query(
    `UPDATE orders
     SET customerid=$1, employeeid=$2, totalprice=$3, orderstatus=$4, date=(NOW() AT TIME ZONE 'America/Chicago')
     WHERE orderid=$5`,
    [customerid, employeeid, totalprice, orderstatus, id]
  );
};

// Update total only, handling points earn/redeem if a customer is attached.
exports.updateTotal = async (id, { totalprice, grossTotal, customerid, pointsUsed }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const baseTotal = parseFloat(grossTotal ?? totalprice ?? 0) || 0;
    const requestedPoints = Math.max(0, parseInt(pointsUsed || 0, 10) || 0);

    let appliedPoints = 0;
    let computedTotal = baseTotal;
    let pointsEarned = 0;
    let pointsBalance = null;

    if (customerid) {
      const currentPoints = await customers.getPoints(customerid);
      appliedPoints = Math.min(requestedPoints, currentPoints, Math.round(baseTotal * 100));
      computedTotal = Math.max(0, baseTotal - appliedPoints / 100);
      pointsEarned = Math.floor(computedTotal * 10); // 10 cents per point
      pointsBalance = await customers.applyPoints(
        {
          customerid,
          pointsUsed: appliedPoints,
          pointsEarned,
        },
        client
      );
    } else {
      // No customer; respect the computed total
      computedTotal = Math.max(0, baseTotal);
    }

    await client.query(
      'UPDATE orders SET totalprice=$1, customerid=COALESCE($2, customerid) WHERE orderid=$3',
      [computedTotal, customerid ?? null, id]
    );

    await client.query('COMMIT');

    return { total: computedTotal, pointsEarned, pointsUsed: appliedPoints, pointsBalance };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
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
