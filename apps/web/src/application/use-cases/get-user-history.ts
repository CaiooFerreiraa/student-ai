import { findUserResultHistory } from "@/infrastructure/repositories/prisma-quiz-browser-repository";

export async function getUserHistory(userId: string) {
  return findUserResultHistory(userId);
}
