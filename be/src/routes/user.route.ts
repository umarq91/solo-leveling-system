import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getStats, getHeatmap } from "../controllers/user.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/stats", getStats);
router.get("/heatmap", getHeatmap);

export default router;
