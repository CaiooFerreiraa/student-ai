import { createQuizResult } from "@/infrastructure/repositories/prisma-quiz-browser-repository";
import { isE2ETestMode } from "@/infrastructure/testing/e2e-mode";

type RecordQuizResultInput = {
  userId: string;
  quizId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  attempts: Array<{
    questionId: string;
    sessionOrder: number;
    questionType: string;
    difficulty: string;
    topic?: string | null;
    isCorrect: boolean | null;
    timeSpentMs: number;
    selectedOption?: number | null;
    answerText?: string | null;
  }>;
};

export async function recordQuizResult(input: RecordQuizResultInput) {
  if (isE2ETestMode()) {
    return {
      id: "result-e2e-1",
      completedAt: new Date("2026-04-10T09:00:00.000Z"),
    };
  }

  return createQuizResult(input);
}
