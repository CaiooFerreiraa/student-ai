import { Prisma } from "@/infrastructure/database/generated/client";
import { getPrismaClient } from "@/infrastructure/database/prisma";
import type { GeneratedQuizPayload } from "@/application/validators/quiz-generation-schemas";
import type { EmbeddedDocumentChunk } from "@/infrastructure/vector/semantic-index";

const quizWithRelationsInclude = {
  subject: true,
  questions: {
    orderBy: {
      position: "asc",
    },
  },
  sourceDocuments: {
    include: {
      chunks: {
        orderBy: {
          sequence: "asc",
        },
      },
    },
  },
} satisfies Prisma.QuizInclude;

type PersistGeneratedQuizInput = {
  subjectId: string;
  title: string;
  description: string;
  difficulty: string;
  questionCount: number;
  model: string;
  cacheKey: string;
  sourceDocument: {
    checksum: string;
    fileName: string;
    mimeType: string;
    rawText: string;
  };
  chunks: EmbeddedDocumentChunk[];
  generatedQuiz: GeneratedQuizPayload;
  expiresAt: Date;
};

type QuizWithRelations = Prisma.QuizGetPayload<{
  include: typeof quizWithRelationsInclude;
}>;

type CachedQuizResult = {
  cache: {
    id: string;
    cacheKey: string;
    responseJson: Prisma.JsonValue;
    model: string;
    expiresAt: Date;
  };
  quiz: QuizWithRelations;
} | null;

export async function findSubjectById(subjectId: string) {
  const prisma = getPrismaClient();

  return prisma.subject.findUnique({
    where: { id: subjectId },
  });
}

export async function findCachedGeneratedQuiz(cacheKey: string): Promise<CachedQuizResult> {
  const prisma = getPrismaClient();
  const cache = await prisma.generatedQuizCache.findUnique({
    where: { cacheKey },
    include: {
      quiz: {
        include: quizWithRelationsInclude,
      },
    },
  });

  if (!cache?.quiz) {
    return null;
  }

  if (cache.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return {
    cache: {
      id: cache.id,
      cacheKey: cache.cacheKey,
      responseJson: cache.responseJson,
      model: cache.model,
      expiresAt: cache.expiresAt,
    },
    quiz: cache.quiz,
  };
}

export async function persistGeneratedQuiz(input: PersistGeneratedQuizInput): Promise<QuizWithRelations> {
  const prisma = getPrismaClient();

  return prisma.$transaction(async (transaction) => {
    const quiz = await transaction.quiz.create({
      data: {
        subjectId: input.subjectId,
        title: input.generatedQuiz.title || input.title,
        description: input.generatedQuiz.description || input.description,
        difficulty: input.difficulty,
        totalQuestions: input.questionCount,
        generationModel: input.model,
        generationStatus: "generated",
        cacheKey: input.cacheKey,
        questions: {
          create: input.generatedQuiz.questions.map((question, index: number) => ({
            position: index,
            type: question.type,
            difficulty: question.difficulty,
            topic: question.topic ?? null,
            prompt: question.prompt,
            options:
              question.options !== null
                ? (question.options as Prisma.InputJsonValue)
                : Prisma.JsonNull,
            answer: question.answer as Prisma.InputJsonValue,
            explanation: question.explanation ?? null,
          })),
        },
        sourceDocuments: {
          create: {
            subjectId: input.subjectId,
            fileName: input.sourceDocument.fileName,
            mimeType: input.sourceDocument.mimeType,
            checksum: input.sourceDocument.checksum,
            rawText: input.sourceDocument.rawText,
            chunkCount: input.chunks.length,
            chunks: {
              create: input.chunks.map((chunk: EmbeddedDocumentChunk) => ({
                sequence: chunk.sequence,
                content: chunk.content,
                tokenEstimate: chunk.tokenEstimate,
                embedding: chunk.embedding as Prisma.InputJsonValue,
              })),
            },
          },
        },
      },
      include: quizWithRelationsInclude,
    });

    await transaction.generatedQuizCache.create({
      data: {
        cacheKey: input.cacheKey,
        subjectId: input.subjectId,
        quizId: quiz.id,
        sourceChecksum: input.sourceDocument.checksum,
        model: input.model,
        difficulty: input.difficulty,
        questionCount: input.questionCount,
        questionTypes: input.generatedQuiz.questions.map((question) => question.type) as Prisma.InputJsonValue,
        responseJson: input.generatedQuiz as Prisma.InputJsonValue,
        expiresAt: input.expiresAt,
      },
    });

    return quiz;
  });
}
