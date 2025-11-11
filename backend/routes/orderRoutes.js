// backend/routes/ordersRoutes.js
const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

// Routes
router.post('/', ordersController.createOrder);
router.put('/:id', ordersController.updateOrder);
router.put('/:id/total', ordersController.updateTotal);
router.get('/:id/items', ordersController.getOrderItems);
router.delete('/:id', ordersController.deleteOrder);

module.exports = router;