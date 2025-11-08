import express from "express";
import { goToHome} from "../controllers/homeController.js";
import {managementLogin} from "../controllers/managementController.js";

const router = express.Router();

// GET/: go to home page
router.get("/", goToHome);           

// POST /api/management/login: Log in as manager
router.post("/login", managementLogin);

export default router;