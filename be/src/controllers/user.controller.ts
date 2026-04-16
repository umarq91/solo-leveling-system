import { Request, Response } from "express";
import * as userService from "../services/user.service.js";
import { AppError } from "../lib/errors.js";

function handleError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal error" });
}

export async function getStats(req: Request, res: Response) {
  try {
    const stats = await userService.getUserStats(req.user.id);
    return res.json(stats);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getHeatmap(req: Request, res: Response) {
  try {
    const raw = Number(req.query.days);
    const days = Number.isFinite(raw) ? Math.min(365, Math.max(7, Math.floor(raw))) : 90;
    const heatmap = await userService.getActivityHeatmap(req.user.id, days);
    return res.json(heatmap);
  } catch (error) {
    return handleError(res, error);
  }
}
