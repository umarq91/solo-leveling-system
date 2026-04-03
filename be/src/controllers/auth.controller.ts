import { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  // TODO: implement
  res.status(501).json({ message: "Not implemented" });
}

export async function login(req: Request, res: Response) {
  // TODO: implement
  res.status(501).json({ message: "Not implemented" });
}

export async function logout(req: Request, res: Response) {
  // TODO: implement
  res.status(501).json({ message: "Not implemented" });
}

export async function getMe(req: Request, res: Response) {
  // TODO: implement (requires auth middleware)
  res.status(501).json({ message: "Not implemented" });
}
