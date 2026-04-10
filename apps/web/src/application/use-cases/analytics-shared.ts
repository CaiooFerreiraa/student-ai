import type { AnalyticsFilters } from "@/application/validators/analytics-schemas";

export type AnalyticsDateRange = {
  gte?: Date;
  lte?: Date;
};

export function resolveAnalyticsDateRange(filters: AnalyticsFilters): AnalyticsDateRange {
  const range: AnalyticsDateRange = {};

  if (filters.period !== "all") {
    const now = new Date();
    const start = new Date(now);

    if (filters.period === "7d") {
      start.setDate(start.getDate() - 7);
    } else if (filters.period === "30d") {
      start.setDate(start.getDate() - 30);
    } else if (filters.period === "90d") {
      start.setDate(start.getDate() - 90);
    } else if (filters.period === "365d") {
      start.setDate(start.getDate() - 365);
    }

    range.gte = start;
  }

  if (filters.from) {
    range.gte = new Date(`${filters.from}T00:00:00.000Z`);
  }

  if (filters.to) {
    range.lte = new Date(`${filters.to}T23:59:59.999Z`);
  }

  return range;
}
