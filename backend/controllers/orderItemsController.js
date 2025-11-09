// backend/controllers/orderItemsController.js
const orderItemsDB = require('../db/orderitems');

// POST /api/orderitems
exports.createOrderItem = async (req, res) => {
  const { orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings } = req.body;
  try {
    const id = await orderItemsDB.insertOrderItem(orderid, drinkid, quantity, price, icelevel, sugarlevel, toppings);
    res.status(201).json({ id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/orderitems/:id
exports.getOrderItem = async (req, res) => {
  try {
    const item = await orderItemsDB.getOrderItemById(req.params.id);
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/orderitems/:id
exports.deleteOrderItem = async (req, res) => {
  try {
    await orderItemsDB.deleteOrderItem(req.params.id);
    res.json({ message: 'Order Deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
