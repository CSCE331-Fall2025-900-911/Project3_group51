import express from "express";
import {
  managementLogin,
  managementLanding,
  getOrderTrends,
  getInventory,
} from "../controllers/managementController.js";

const router = express.Router();

// POST /api/management/login
router.post("/login", managementLogin);

// GET /api/management/: Home page for managers
router.get("/", managementLanding);

// GET /api/management/trends: Get trends order
router.get("/trends", getOrderTrends);

// GET /api/management/inventory: Stock alerts
router.get("/inventories", getInventory);

export default router;
