import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  getMyQuests,
  getQuestsHistory,
  completeQuest,
} from "../controllers/quest.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyQuests);
router.get("/history", getQuestsHistory);
router.post("/:id/complete", completeQuest);

export default router;
