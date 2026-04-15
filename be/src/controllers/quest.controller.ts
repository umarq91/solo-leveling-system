import { Request, Response } from "express";
import * as questService from "../services/quest.service.js";
import { AppError } from "../lib/errors.js";

function handleError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal error" });
}

export async function getMyQuests(req: Request, res: Response) {
  try {
    const quests = await questService.getActiveQuests(req.user.id);
    return res.json({ quests });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getQuestsHistory(req: Request, res: Response) {
  try {
    const quests = await questService.getQuestsHistory(req.user.id);
    return res.json({ quests });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function assignQuest(req: Request, res: Response) {
  try {
    const questId = parseInt(req.params.questId as string, 10);
    if (isNaN(questId)) {
      return res.status(400).json({ message: "Invalid quest id" });
    }
    const userQuest = await questService.assignQuest(req.user.id, questId);
    return res.status(201).json({ userQuest });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function assignDailyQuests(req: Request, res: Response) {
  try {
    const result = await questService.assignDailyQuests(req.user.id);
    return res.status(201).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function completeQuest(req: Request, res: Response) {
  try {
    const userQuestId = parseInt(req.params.id as string, 10);
    if (isNaN(userQuestId)) {
      return res.status(400).json({ message: "Invalid quest id" });
    }
    const result = await questService.completeQuest(req.user.id, userQuestId);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}
