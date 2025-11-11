// backend/controllers/orderItemsController.js
const orderItemsDB = require('../db/orderitems');

// POST /api/orderitems
exports.createOrderItem = async (req, res) => {
  const { orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings } = req.body;
  try {
    console.log("POST /api/orderitems - body:", req.body);
    const id = await orderItemsDB.insertOrderItem(orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings);
     console.log("Created new order item with ID:", id, "for order:", orderid);
    res.status(201).json({ id });
  } catch (e) {
    console.error("Error in createOrderItem:", e);
    res.status(500).json({ error: e.message });
  }
};

// GET /api/orderitems/:id
exports.getOrderItem = async (req, res) => {
  try {
    console.log("GET /api/orderitems/" + req.params.id);
    const item = await orderItemsDB.getOrderItemById(req.params.id);
    console.log("Fetched order item:", item);
    res.json(item);
  } catch (e) {
     console.error("Error in getOrderItem:", e);
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/orderitems/:id
exports.deleteOrderItem = async (req, res) => {
  try {
    console.log("DELETE /api/orderitems/" + req.params.id);
    await orderItemsDB.deleteOrderItem(req.params.id);
    console.log("Deleted order item:", req.params.id);
    res.json({ message: 'Order Deleted' });
  } catch (e) {
    console.error("Error in deleteOrderItem:", e);
    res.status(500).json({ error: e.message });
  }
};