import { findUserByEmail } from "@/infrastructure/repositories/prisma-user-repository";

export async function getUserByEmail(email: string) {
  return findUserByEmail(email);
}
