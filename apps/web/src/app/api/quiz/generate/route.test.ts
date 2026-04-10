import { NextRequest } from "next/server";

describe("POST /api/quiz/generate", () => {
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

  function createRequest(): NextRequest {
    const formData = new FormData();
    formData.set("subjectId", "subject-math");
    formData.set("title", "Revisao guiada");
    formData.set("difficulty", "ensino_superior");
    formData.set("questionCount", "3");
    formData.append("questionTypes", "multiple_choice");
    formData.append("questionTypes", "true_false");
    formData.set("pdf", new File(["fake pdf"], "context.pdf", { type: "application/pdf" }));

    return new NextRequest("http://localhost:3000/api/quiz/generate", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
      },
      body: formData,
    });
  }

  it("returns 503 when quiz generation is disabled", async () => {
    jest.doMock("@/infrastructure/config/feature-flags", () => ({
      isFeatureEnabled: jest.fn(() => false),
    }));
    jest.doMock("@/auth", () => ({
      auth: jest.fn().mockResolvedValue({
        user: {
          id: "user-1",
        },
      }),
    }));

    const { POST } = await import("@/app/api/quiz/generate/route");
    const response = await POST(createRequest());

    expect(response.status).toBe(503);
  });

  it("returns an SSE stream for authenticated E2E mode", async () => {
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
    jest.doMock("@/infrastructure/testing/e2e-mode", () => ({
      isE2ETestMode: jest.fn(() => true),
    }));

    const { POST } = await import("@/app/api/quiz/generate/route");
    const response = await POST(createRequest());
    const payload = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/event-stream");
    expect(payload).toContain("event: progress");
    expect(payload).toContain("event: done");
    expect(payload).toContain("\"quizId\":\"e2e-generated-quiz\"");
  });
});
