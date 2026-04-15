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
