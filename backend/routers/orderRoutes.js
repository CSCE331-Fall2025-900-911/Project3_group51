import express from "express";
import { startOrder, createOrder, getOrderById, getAllOrders } from "../controllers/orderController.js";

const router = express.Router();

router.get('/', startOrder);
router.post("/", createOrder); // Create new order
router.get("/:id", getOrderById); // Get order by id
router.get("/all", getAllOrders); // Get all orders

export default router;