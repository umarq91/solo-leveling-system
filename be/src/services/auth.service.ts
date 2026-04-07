import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { xpToNextLevel } from "../lib/xp.js";

export async function registerUser(username: string, email: string, password: string) {
  const existing = await prisma.users.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existing) {
    const field = existing.email === email ? "Email" : "Username";
    throw new AppError(409, `${field} is already taken`);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.users.create({
    data: {
      username,
      email,
      password: hashedPassword,
      level: 1,
      rank: "E",
      current_xp: 0,
      total_xp: 0,
      streak_days: 0,
      up_to_next: xpToNextLevel(1),
    },
  });

  const { password: _, ...rest } = user;
  return rest;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.users.findFirst({ where: { email } });

  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new AppError(401, "Invalid credentials");
  }

  const payload = {
    id: user.id,
    username: user.username,
    rank: user.rank,
    level: user.level,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET ?? "SECRET");

  const { password: _, ...rest } = user;
  return { token, user: rest };
}

export async function getUser(id: number) {
  const user = await prisma.users.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const { password: _, ...rest } = user;
  return rest;
}
