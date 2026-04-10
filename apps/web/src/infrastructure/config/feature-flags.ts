import { getServerEnv } from "@/infrastructure/config/env";

type FeatureFlag =
  | "analyticsApi"
  | "analyticsDashboard"
  | "quizGeneration"
  | "exportReports"
  | "apiDocs"
  | "sentry";

const featureFlagDefaults: Record<FeatureFlag, boolean> = {
  analyticsApi: true,
  analyticsDashboard: true,
  quizGeneration: true,
  exportReports: true,
  apiDocs: true,
  sentry: true,
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const env = getServerEnv();

  if (flag === "analyticsApi") {
    return env.FEATURE_ANALYTICS_API ?? featureFlagDefaults.analyticsApi;
  }

  if (flag === "analyticsDashboard") {
    return env.FEATURE_ANALYTICS_DASHBOARD ?? featureFlagDefaults.analyticsDashboard;
  }

  if (flag === "quizGeneration") {
    return env.FEATURE_QUIZ_GENERATION ?? featureFlagDefaults.quizGeneration;
  }

  if (flag === "exportReports") {
    return env.FEATURE_EXPORT_REPORTS ?? featureFlagDefaults.exportReports;
  }

  if (flag === "apiDocs") {
    return env.FEATURE_API_DOCS ?? featureFlagDefaults.apiDocs;
  }

  return env.FEATURE_SENTRY ?? featureFlagDefaults.sentry;
}
