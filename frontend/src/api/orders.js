
// Get the API base URL from the environment variable
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Creates a new blank order in the database.
 * 'employeeid' is hardcoded to 1 (representing the Kiosk itself).
 * @returns {Promise<{id: number}>} The new order ID
 */
export async function createOrder() {
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // employeeid 1 is a placeholder for the kiosk/customer order
    body: JSON.stringify({ employeeid: 1 }), 
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
  };

  const res = await fetch(`${API}/orderitems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on addOrderItem`);
  return res.json();
}

/**
 * Updates the total price of an order after all items are added.
 * @param {number} orderId - The ID of the order to update
 * @param {number} total - The final calculated total price
 */
export async function updateOrderTotal(orderId, total) {
  const res = await fetch(`${API}/orders/${orderId}/total`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ totalprice: total }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on updateOrderTotal`);
  return res.json();
}