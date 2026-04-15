import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  getMyQuests,
  getQuestsHistory,
  assignQuest,
  assignDailyQuests,
  completeQuest,
} from "../controllers/quest.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyQuests);
router.get("/history", getQuestsHistory);
router.post("/daily", assignDailyQuests);
router.post("/:questId/assign", assignQuest);
router.post("/:id/complete", completeQuest);

export default router;
