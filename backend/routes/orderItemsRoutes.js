// backend/routes/orderItemsRoutes.js
const express = require('express');
const router = express.Router();
const orderItemsController = require('../controllers/orderItemsController');

router.post('/', orderItemsController.createOrderItem);
router.get('/:id', orderItemsController.getOrderItem);
router.delete('/:id', orderItemsController.deleteOrderItem);

module.exports = router;
