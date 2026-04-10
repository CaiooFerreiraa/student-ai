import type { AnalyticsFilters, PaginatedHistoryQuery } from "@/application/validators/analytics-schemas";
import { findPaginatedHistory } from "@/infrastructure/repositories/prisma-analytics-repository";
import { isE2ETestMode } from "@/infrastructure/testing/e2e-mode";
import { getMockPaginatedHistory } from "@/infrastructure/testing/mock-data";

export async function getPaginatedHistory(
  userId: string,
  query: PaginatedHistoryQuery & AnalyticsFilters,
) {
  if (isE2ETestMode()) {
    return getMockPaginatedHistory();
  }

  return findPaginatedHistory(userId, query);
}
