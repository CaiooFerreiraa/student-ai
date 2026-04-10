import { getPrismaClient } from "@/infrastructure/database/prisma";

export async function countDashboardMetrics(userId: string) {
  const prisma = getPrismaClient();

  const [subjects, quizzes, results] = await Promise.all([
    prisma.subject.count(),
    prisma.quiz.count(),
    prisma.result.count({
      where: { userId },
    }),
  ]);

  return { subjects, quizzes, results };
}
