import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  getMyQuests,
  getQuestsHistory,
  assignQuest,
  assignDailyQuests,
  assignWeeklyQuests,
  assignSideQuests,
  completeQuest,
} from "../controllers/quest.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyQuests);
router.get("/history", getQuestsHistory);
router.post("/daily", assignDailyQuests);
router.post("/weekly", assignWeeklyQuests);
router.post("/side", assignSideQuests);
router.post("/:questId/assign", assignQuest);
router.post("/:id/complete", completeQuest);

export default router;
