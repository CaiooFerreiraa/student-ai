import { countDashboardMetrics } from "@/infrastructure/repositories/prisma-dashboard-repository";

export async function getDashboardMetrics(userId: string) {
  return countDashboardMetrics(userId);
}
