import express from "express";
import { goToHome} from "../controllers/homeController.js";
import {managementLogin} from "../controllers/managementController.js";
import {startOrder} from "../controllers/orderController.js";

const router = express.Router();

// GET/: go to home page
router.get("/weather", goToHome);           

// POST /api/management/login: Log in as manager
router.post("/login/", managementLogin);

export default router;