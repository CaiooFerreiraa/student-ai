import type { Prisma } from "@/infrastructure/database/generated/client";
import type { AnalyticsFilters, PaginatedHistoryQuery } from "@/application/validators/analytics-schemas";
import { resolveAnalyticsDateRange } from "@/application/use-cases/analytics-shared";
import { getPrismaClient } from "@/infrastructure/database/prisma";

function buildAttemptWhere(userId: string, filters: AnalyticsFilters): Prisma.QuestionAttemptWhereInput {
  const dateRange = resolveAnalyticsDateRange(filters);

  return {
    userId,
    ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
    ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
    ...(filters.questionType ? { questionType: filters.questionType } : {}),
    ...(dateRange.gte || dateRange.lte ? { createdAt: dateRange } : {}),
  };
}

function buildResultWhere(userId: string, filters: AnalyticsFilters): Prisma.ResultWhereInput {
  const dateRange = resolveAnalyticsDateRange(filters);
  const attemptFilters: Prisma.QuestionAttemptWhereInput = {
    ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
    ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
    ...(filters.questionType ? { questionType: filters.questionType } : {}),
  };
  const hasAttemptFilter = Boolean(filters.subjectId || filters.difficulty || filters.questionType);

  return {
    userId,
    ...(dateRange.gte || dateRange.lte ? { completedAt: dateRange } : {}),
    ...(hasAttemptFilter ? { questionAttempts: { some: attemptFilters } } : {}),
  };
}

export async function findAnalyticsSourceData(userId: string, filters: AnalyticsFilters) {
  const prisma = getPrismaClient();

  const [attempts, results] = await Promise.all([
    prisma.questionAttempt.findMany({
      where: buildAttemptWhere(userId, filters),
      select: {
        id: true,
        questionType: true,
        difficulty: true,
        topic: true,
        isCorrect: true,
        timeSpentMs: true,
        createdAt: true,
        subject: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.result.findMany({
      where: buildResultWhere(userId, filters),
      select: {
        id: true,
        score: true,
        correctAnswers: true,
        totalQuestions: true,
        completedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            subject: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: "asc",
      },
    }),
  ]);

  return { attempts, results };
}

export async function findQuizRecommendation(input: {
  subjectId: string;
  difficulty?: string;
}) {
  const prisma = getPrismaClient();

  return prisma.quiz.findFirst({
    where: {
      subjectId: input.subjectId,
      ...(input.difficulty ? { difficulty: input.difficulty } : {}),
    },
    select: {
      id: true,
      title: true,
      difficulty: true,
      totalQuestions: true,
      subject: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function findPaginatedHistory(userId: string, query: PaginatedHistoryQuery & AnalyticsFilters) {
  const prisma = getPrismaClient();
  const where = buildResultWhere(userId, query);
  const skip = (query.page - 1) * query.pageSize;

  const [items, total] = await Promise.all([
    prisma.result.findMany({
      where,
      include: {
        quiz: {
          include: {
            subject: true,
          },
        },
        questionAttempts: {
          orderBy: {
            sessionOrder: "asc",
          },
          select: {
            questionType: true,
            difficulty: true,
            topic: true,
            isCorrect: true,
            timeSpentMs: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      skip,
      take: query.pageSize,
    }),
    prisma.result.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function findSessionReport(userId: string, resultId: string) {
  const prisma = getPrismaClient();

  return prisma.result.findFirst({
    where: {
      id: resultId,
      userId,
    },
    include: {
      quiz: {
        include: {
          subject: true,
        },
      },
      questionAttempts: {
        orderBy: {
          sessionOrder: "asc",
        },
        include: {
          question: {
            select: {
              prompt: true,
              explanation: true,
            },
          },
        },
      },
    },
  });
}
