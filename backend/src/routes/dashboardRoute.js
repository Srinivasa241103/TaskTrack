import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import Dashboard from "../controllers/dashboardController.js";

const dashboard = new Dashboard();
const router = Router();

router.get("/", authMiddleware, dashboard.getData);

export default router;