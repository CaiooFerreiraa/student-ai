describe("rate limit", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/student_ai",
      AUTH_SECRET: "12345678901234567890123456789012",
      AUTH_TRUST_HOST: "true",
      LOCAL_RATE_LIMIT_MODE: "true",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("allows requests below the local limit", async () => {
    const { applyRateLimit } = await import("@/infrastructure/security/rate-limit");

    const decision = await applyRateLimit("127.0.0.1", "api");

    expect(decision.success).toBe(true);
    expect(decision.reason).toBe("ok");
    expect(decision.limit).toBe(60);
  });

  it("blocks requests after the auth window is exhausted", async () => {
    const { applyRateLimit } = await import("@/infrastructure/security/rate-limit");

    for (let index = 0; index < 10; index += 1) {
      await applyRateLimit("auth-user", "auth");
    }

    const decision = await applyRateLimit("auth-user", "auth");

    expect(decision.success).toBe(false);
    expect(decision.reason).toBe("limited");
    expect(decision.remaining).toBe(0);
  });

  it("disables rate limiting when neither local mode nor Upstash is configured", async () => {
    process.env.LOCAL_RATE_LIMIT_MODE = "false";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    jest.resetModules();

    const { applyRateLimit } = await import("@/infrastructure/security/rate-limit");
    const decision = await applyRateLimit("127.0.0.1", "api");

    expect(decision.success).toBe(true);
    expect(decision.reason).toBe("disabled");
  });

  it("uses the Upstash limiter when configured", async () => {
    const limit = jest.fn().mockResolvedValue({
      success: false,
      limit: 60,
      remaining: 0,
      reset: 123456,
    });

    process.env.LOCAL_RATE_LIMIT_MODE = "false";
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    jest.resetModules();
    jest.doMock("@upstash/redis", () => ({
      Redis: jest.fn().mockImplementation(() => ({})),
    }));
    jest.doMock("@upstash/ratelimit", () => ({
      Ratelimit: class {
        static slidingWindow() {
          return "window";
        }

        limit = limit;
      },
    }));

    const { applyRateLimit } = await import("@/infrastructure/security/rate-limit");
    const decision = await applyRateLimit("127.0.0.1", "api");

    expect(decision.success).toBe(false);
    expect(decision.reason).toBe("limited");
    expect(limit).toHaveBeenCalledWith("127.0.0.1");
  });
});
