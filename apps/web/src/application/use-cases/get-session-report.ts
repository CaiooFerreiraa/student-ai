import { findSessionReport } from "@/infrastructure/repositories/prisma-analytics-repository";
import { isE2ETestMode } from "@/infrastructure/testing/e2e-mode";
import { getMockSessionReport } from "@/infrastructure/testing/mock-data";

export async function getSessionReport(userId: string, resultId: string) {
  if (isE2ETestMode()) {
    return getMockSessionReport();
  }

  return findSessionReport(userId, resultId);
}
