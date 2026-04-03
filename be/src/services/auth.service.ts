import { db } from "../lib/db.js";

export async function registerUser(username: string, email: string, password: string) {
  // TODO: hash password, create user
  throw new Error("Not implemented");
}

export async function loginUser(email: string, password: string) {
  // TODO: verify password, return token
  throw new Error("Not implemented");
}

export async function getUserById(id: number) {
  return db.users.findUnique({ where: { id } });
}
