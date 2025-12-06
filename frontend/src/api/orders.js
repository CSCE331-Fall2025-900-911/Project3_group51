
// Get the API base URL from the environment variable
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Creates a new blank order in the database.
 * 'employeeid' is hardcoded to 1 (representing the Kiosk itself) unless overridden.
 * Accepts optional customerid for loyalty tracking.
 * @returns {Promise<{id: number}>} The new order ID
 */
export async function createOrder({ employeeid = 1, customerid = null } = {}) {
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeid, customerid }), 
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on createOrder`);
  return res.json(); // Returns { id: new_order_id }
}

/**
 * Adds a single customized item to an existing order.
 * @param {object} item - The item object from the cart
 * @param {number} orderId - The ID from createOrder()
 */
export async function addOrderItem(item, orderId) {
  const payload = {
    orderid: orderId,
    drinkid: item.id,
    quantity: item.quantity, // We'll add this in the next step
    price: item.price,
    icelevel: item.ice,
    sugarlevel: item.sugar,
    toppings: item.toppings, // Assumes backend accepts array
    comments: item.comments ? item.comments.slice(0, 255) : null,
  };

  const res = await fetch(`${API}/orderitems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`HTTP ${res.status} on addOrderItem`);
    err.details = text;
    throw err;
  }
  return res.json();
}

/**
 * Updates the total price of an order after all items are added.
 * @param {number} orderId - The ID of the order to update
 * @param {object} payload - { totalprice, grossTotal, customerid, pointsUsed }
 */
export async function updateOrderTotal(orderId, { totalprice, grossTotal, customerid = null, pointsUsed = 0 }) {
  const res = await fetch(`${API}/orders/${orderId}/total`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ totalprice, grossTotal, customerid, pointsUsed }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on updateOrderTotal`);
  return res.json();
}
