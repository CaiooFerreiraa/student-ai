import { getDashboardMetrics } from "@/application/use-cases/get-dashboard-metrics";
import { findQuizCatalogItems, findUserResultHistory } from "@/infrastructure/repositories/prisma-quiz-browser-repository";
import { listSubjects } from "@/application/use-cases/list-subjects";
import { isE2ETestMode } from "@/infrastructure/testing/e2e-mode";
import { getMockDashboardOverview } from "@/infrastructure/testing/mock-data";

export async function getDashboardOverview(userId: string) {
  if (isE2ETestMode()) {
    return getMockDashboardOverview();
  }

  const [metrics, subjects, quizzes, history] = await Promise.all([
    getDashboardMetrics(userId),
    listSubjects(),
    findQuizCatalogItems(),
    findUserResultHistory(userId),
  ]);

  return {
    metrics,
    subjects,
    quizzes,
    history,
  };
}
