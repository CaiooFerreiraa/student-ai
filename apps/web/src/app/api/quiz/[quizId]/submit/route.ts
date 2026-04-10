import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { recordQuizResult } from "@/application/use-cases/record-quiz-result";
import { quizSubmissionSchema, type QuizSubmissionRequest } from "@/application/validators/quiz-generation-schemas";
import { createApiRoute, createPreflightHandler } from "@/infrastructure/security/api-route";

type QuizSubmitBody = QuizSubmissionRequest;

type QuizSubmitParams = {
  quizId: string;
};

const quizSubmitParamsSchema = z.object({
  quizId: z.string().trim().min(1),
});

export const OPTIONS = createPreflightHandler();

export const POST = createApiRoute<QuizSubmitBody, undefined, QuizSubmitParams>(
  {
    body: quizSubmissionSchema,
    params: quizSubmitParamsSchema,
  },
  async ({
    body,
    params,
  }: {
    request: NextRequest;
    body: QuizSubmitBody;
    query: undefined;
    params: QuizSubmitParams;
  }) => {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
    }

    if (params.quizId !== body.quizId) {
      return NextResponse.json({ error: "Quiz inválido." }, { status: 400 });
    }

    const result = await recordQuizResult({
      userId: session.user.id,
      quizId: body.quizId,
      score: body.score,
      correctAnswers: body.correctAnswers,
      totalQuestions: body.totalQuestions,
      attempts: body.attempts,
    });

    return NextResponse.json(
      {
        id: result.id,
        completedAt: result.completedAt,
      },
      { status: 201 },
    );
  },
);
