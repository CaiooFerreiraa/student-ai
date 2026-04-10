import { NextRequest } from "next/server";

describe("POST /api/quiz/[quizId]/submit", () => {
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

  const validBody = {
    quizId: "quiz-1",
    score: 80,
    correctAnswers: 4,
    totalQuestions: 5,
    attempts: [
      {
        questionId: "question-1",
        sessionOrder: 0,
        questionType: "multiple_choice",
        difficulty: "ensino_medio",
        topic: "Álgebra",
        isCorrect: true,
        timeSpentMs: 12000,
        selectedOption: 1,
        answerText: null,
      },
    ],
  };

  it("requires authentication", async () => {
    jest.doMock("@/auth", () => ({
      auth: jest.fn().mockResolvedValue(null),
    }));

    const { POST } = await import("@/app/api/quiz/[quizId]/submit/route");
    const request = new NextRequest("http://localhost:3000/api/quiz/quiz-1/submit", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request, { params: Promise.resolve({ quizId: "quiz-1" }) });

    expect(response.status).toBe(401);
  });

  it("rejects mismatched quiz ids", async () => {
    jest.doMock("@/auth", () => ({
      auth: jest.fn().mockResolvedValue({
        user: {
          id: "user-1",
        },
      }),
    }));

    const { POST } = await import("@/app/api/quiz/[quizId]/submit/route");
    const request = new NextRequest("http://localhost:3000/api/quiz/quiz-2/submit", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request, { params: Promise.resolve({ quizId: "quiz-2" }) });

    expect(response.status).toBe(400);
  });

  it("stores a valid quiz result", async () => {
    const recordQuizResult = jest.fn().mockResolvedValue({
      id: "result-1",
      completedAt: "2026-04-10T12:00:00.000Z",
    });

    jest.doMock("@/auth", () => ({
      auth: jest.fn().mockResolvedValue({
        user: {
          id: "user-1",
        },
      }),
    }));
    jest.doMock("@/application/use-cases/record-quiz-result", () => ({
      recordQuizResult,
    }));

    const { POST } = await import("@/app/api/quiz/[quizId]/submit/route");
    const request = new NextRequest("http://localhost:3000/api/quiz/quiz-1/submit", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request, { params: Promise.resolve({ quizId: "quiz-1" }) });
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.id).toBe("result-1");
    expect(recordQuizResult).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        quizId: "quiz-1",
      }),
    );
  });
});
