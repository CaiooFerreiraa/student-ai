describe("feature flags", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/student_ai",
      AUTH_SECRET: "12345678901234567890123456789012",
      AUTH_TRUST_HOST: "true",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses explicit env overrides when present", async () => {
    process.env.FEATURE_API_DOCS = "false";

    const { isFeatureEnabled } = await import("@/infrastructure/config/feature-flags");

    expect(isFeatureEnabled("apiDocs")).toBe(false);
  });

  it("falls back to defaults when env is omitted", async () => {
    delete process.env.FEATURE_ANALYTICS_API;

    const { isFeatureEnabled } = await import("@/infrastructure/config/feature-flags");

    expect(isFeatureEnabled("analyticsApi")).toBe(true);
  });

  it("maps all supported flags to their env keys", async () => {
    process.env.FEATURE_ANALYTICS_DASHBOARD = "false";
    process.env.FEATURE_QUIZ_GENERATION = "false";
    process.env.FEATURE_EXPORT_REPORTS = "false";
    process.env.FEATURE_SENTRY = "false";

    const { isFeatureEnabled } = await import("@/infrastructure/config/feature-flags");

    expect(isFeatureEnabled("analyticsDashboard")).toBe(false);
    expect(isFeatureEnabled("quizGeneration")).toBe(false);
    expect(isFeatureEnabled("exportReports")).toBe(false);
    expect(isFeatureEnabled("sentry")).toBe(false);
  });
});
