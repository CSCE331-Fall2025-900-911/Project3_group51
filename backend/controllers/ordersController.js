// backend/controllers/ordersController.js
const ordersDB = require('../db/orders');

// POST /api/orders/: create new order
exports.createOrder = async (req, res) => {
  try {
    const { employeeid } = req.body;
    const id = await ordersDB.createOrder(employeeid);
    res.status(201).json({ message: `Created new order with #id${id}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/orders/:id: update order
exports.updateOrder = async (req, res) => {
  try {
    await ordersDB.updateOrder(req.params.id, req.body);
    res.json({ message: 'Updated order' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/orders/:id/total: update order total
exports.updateTotal = async (req, res) => {
  try {
    await ordersDB.updateTotal(req.params.id, req.body.totalprice);
    res.json({ message: 'Total updated' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/orders/:id/items
exports.getOrderItems = async (req, res) => {
  try {
    const items = await ordersDB.getOrderItems(req.params.id);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    await ordersDB.deleteOrder(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
