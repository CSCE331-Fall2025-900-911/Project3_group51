// backend/controllers/ordersController.js
const ordersDB = require('../db/orders');

// POST /api/orders/: create new order
exports.createOrder = async (req, res) => {
  try {
    const { employeeid, customerid } = req.body;
    console.log("POST /api/orders - employeeid:", employeeid, "customerid:", customerid);
    const id = await ordersDB.createOrder(employeeid, customerid);
    console.log("Created new order ID:", id);
    res.status(201).json({
      id : id, 
      message: `Created new order #${id}` });
  } catch (e) {
    console.error("Error in createOrder:", e);
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
    const { totalprice, customerid, pointsUsed, grossTotal } = req.body;
    console.log("PUT /api/orders/" + req.params.id + "/total", {
      totalprice,
      grossTotal,
      customerid,
      pointsUsed,
    });
    const result = await ordersDB.updateTotal(req.params.id, {
      totalprice,
      grossTotal,
      customerid,
      pointsUsed,
    });
    console.log("Updated total for order:", req.params.id);
    res.json({ message: 'Total updated', ...result });
  } catch (e) {
    console.error("Error in updateTotal:", e);
    res.status(500).json({ error: e.message });
  }
};

// GET /api/orders/:id/items
exports.getOrderItems = async (req, res) => {
  try {
    console.log("GET /api/orders/" + req.params.id + "/items");
    const items = await ordersDB.getOrderItems(req.params.id);
    console.log("Fetched order items:", items);
    res.json(items);
  } catch (e) {
    console.error("Error in getOrderItems:", e);
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    console.log("DELETE /api/orders/" + req.params.id);
    await ordersDB.deleteOrder(req.params.id);
     console.log("Deleted order:", req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (e) {
    console.error("Error in deleteOrder:", e);
    res.status(500).json({ error: e.message });
  }
};
