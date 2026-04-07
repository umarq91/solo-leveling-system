import { Request, Response } from "express";
import { AppError } from "../lib/errors.js";
import * as authService from "../services/auth.service.js";

function handleError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal server error" });
}

export async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;
  try {
    const user = await authService.registerUser(username, email, password);
    return res.status(201).json({ message: "User successfully created", user });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const result = await authService.loginUser(email, password);
    return res.json({ message: "Logged in", ...result });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function logout(req: Request, res: Response) {
  // TODO: implement token invalidation
  res.status(501).json({ message: "Not implemented" });
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await authService.getUser(req.user?.id);
    return res.json({ user });
  } catch (error) {
    return handleError(res, error);
  }
}
