import { NextRequest } from "next/server";

describe("GET /api/analytics/overview", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SECURITY_CORS_ALLOWED_ORIGINS: "http://localhost:3000,https://student-ai.vercel.app",
      SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS: "https://student-ai-*.vercel.app",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("returns 404 when the analytics feature is disabled", async () => {
    jest.doMock("@/infrastructure/config/feature-flags", () => ({
      isFeatureEnabled: jest.fn(() => false),
    }));
    jest.doMock("@/auth", () => ({
      auth: jest.fn(),
    }));

    const { GET } = await import("@/app/api/analytics/overview/route");
    const request = new NextRequest("http://localhost:3000/api/analytics/overview", {
      method: "GET",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(404);
  });

  it("returns 401 when the request is unauthenticated", async () => {
    jest.doMock("@/infrastructure/config/feature-flags", () => ({
      isFeatureEnabled: jest.fn(() => true),
    }));
    jest.doMock("@/auth", () => ({
      auth: jest.fn().mockResolvedValue(null),
    }));

    const { GET } = await import("@/app/api/analytics/overview/route");
    const request = new NextRequest("http://localhost:3000/api/analytics/overview?period=30d", {
      method: "GET",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("returns overview payload for authenticated users", async () => {
    const getAnalyticsOverview = jest.fn().mockResolvedValue({
      summary: {
        totalSessions: 1,
        averageScore: 88,
        totalAttempts: 10,
        totalCorrect: 8,
        averageTimeMs: 15000,
        accuracyRate: 80,
      },
      subjectBreakdown: [],
      difficultyBreakdown: [],
      questionTypeBreakdown: [],
      weakTopics: [],
      timeline: [],
      recommendation: null,
    });

    jest.doMock("@/infrastructure/config/feature-flags", () => ({
      isFeatureEnabled: jest.fn(() => true),
    }));
    jest.doMock("@/auth", () => ({
      auth: jest.fn().mockResolvedValue({
        user: {
          id: "user-1",
        },
      }),
    }));
    jest.doMock("@/application/use-cases/get-analytics-overview", () => ({
      getAnalyticsOverview,
    }));

    const { GET } = await import("@/app/api/analytics/overview/route");
    const request = new NextRequest("http://localhost:3000/api/analytics/overview?period=30d", {
      method: "GET",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.summary.averageScore).toBe(88);
    expect(getAnalyticsOverview).toHaveBeenCalledWith("user-1", expect.objectContaining({ period: "30d" }));
  });
});
