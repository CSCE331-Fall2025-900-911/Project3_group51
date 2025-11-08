import express from "express";
import { goToHome} from "../controllers/homeController.js";
const router = express.Router();

// GET/: go to home page
router.get("/weather", goToHome);           

export default router;