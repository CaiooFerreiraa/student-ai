import { getPrismaClient } from "@/infrastructure/database/prisma";

export async function findQuizCatalogItems() {
  const prisma = getPrismaClient();

  return prisma.quiz.findMany({
    include: {
      subject: true,
      questions: {
        orderBy: {
          position: "asc",
        },
      },
      _count: {
        select: {
          results: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function findQuizById(quizId: string) {
  const prisma = getPrismaClient();

  return prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      subject: true,
      questions: {
        orderBy: {
          position: "asc",
        },
      },
      sourceDocuments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function findUserResultHistory(userId: string) {
  const prisma = getPrismaClient();

  return prisma.result.findMany({
    where: {
      userId,
    },
    include: {
      quiz: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });
}

export async function createQuizResult(input: {
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
}) {
  const prisma = getPrismaClient();

  return prisma.$transaction(async (transaction) => {
    const quiz = await transaction.quiz.findUnique({
      where: {
        id: input.quizId,
      },
      select: {
        id: true,
        subjectId: true,
        questions: {
          select: {
            id: true,
            type: true,
            difficulty: true,
            topic: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new Error("Quiz não encontrado para registro do resultado.");
    }

    const questionMap = new Map(
      quiz.questions.map((question) => [
        question.id,
        {
          type: question.type,
          difficulty: question.difficulty,
          topic: question.topic,
        },
      ]),
    );

    const hasInvalidAttempt = input.attempts.some((attempt) => !questionMap.has(attempt.questionId));

    if (hasInvalidAttempt) {
      throw new Error("Tentativa contém questão inválida para este quiz.");
    }

    const result = await transaction.result.create({
      data: {
        userId: input.userId,
        quizId: input.quizId,
        score: input.score,
        correctAnswers: input.correctAnswers,
        totalQuestions: input.totalQuestions,
      },
    });

    await transaction.questionAttempt.createMany({
      data: input.attempts.map((attempt) => {
        const question = questionMap.get(attempt.questionId);

        return {
          resultId: result.id,
          userId: input.userId,
          quizId: input.quizId,
          subjectId: quiz.subjectId,
          questionId: attempt.questionId,
          sessionOrder: attempt.sessionOrder,
          questionType: question?.type ?? attempt.questionType,
          difficulty: question?.difficulty ?? attempt.difficulty,
          topic: question?.topic ?? attempt.topic ?? null,
          isCorrect: attempt.isCorrect,
          timeSpentMs: attempt.timeSpentMs,
          selectedOption: attempt.selectedOption ?? null,
          answerText: attempt.answerText ?? null,
        };
      }),
    });

    return result;
  });
}
