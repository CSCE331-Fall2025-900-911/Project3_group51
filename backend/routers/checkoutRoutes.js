import express from "express";
import { checkoutOrder, processPayment } from "../controllers/checkoutController.js";

const router = express.Router();

// POST /api/checkout
router.post("/", checkoutOrder);

// POST /api/checkout/payment
router.post("/payment", processPayment);

export default router;
