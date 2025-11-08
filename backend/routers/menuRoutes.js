import express from "express";
import { getMenu, addMenuItem} from "../controllers/menuController.js";

const router = express.Router();

router.get("/", getMenu);           // GET /api/menu
router.post("/", addMenuItem);      // POST /api/menu

export default router;