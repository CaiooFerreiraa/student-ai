describe("e2e mode", () => {
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

  it("returns true when E2E mode is enabled", async () => {
    process.env.E2E_TEST_MODE = "true";

    const { isE2ETestMode } = await import("@/infrastructure/testing/e2e-mode");

    expect(isE2ETestMode()).toBe(true);
  });

  it("returns false by default", async () => {
    delete process.env.E2E_TEST_MODE;

    const { isE2ETestMode } = await import("@/infrastructure/testing/e2e-mode");

    expect(isE2ETestMode()).toBe(false);
  });
});
