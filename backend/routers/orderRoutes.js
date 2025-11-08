import express from "express";
import { createOrder, getOrderById, getAllOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder); // Create new order
router.get("/:id", getOrderById); // Get order by id
router.get("/", getAllOrders); // Get all orders

export default router;