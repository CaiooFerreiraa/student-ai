import { createHash } from "node:crypto";
import type {
  GeneratedQuizPayload,
  QuizGenerationRequest,
} from "@/application/validators/quiz-generation-schemas";
import { generatedQuizPayloadSchema } from "@/application/validators/quiz-generation-schemas";
import { generateQuizWithLangChain } from "@/infrastructure/ai/quiz-generation-agent";
import { parsePdfUpload } from "@/infrastructure/documents/pdf-parser";
import { chunkDocumentText } from "@/infrastructure/documents/text-chunker";
import {
  findCachedGeneratedQuiz,
  findSubjectById,
  persistGeneratedQuiz,
} from "@/infrastructure/repositories/prisma-quiz-generation-repository";
import { rankDocumentChunks, embedDocumentChunks } from "@/infrastructure/vector/semantic-index";

export type QuizGenerationProgressEvent = {
  step:
    | "received"
    | "parsed"
    | "chunked"
    | "embedded"
    | "retrieved"
    | "cached"
    | "generated"
    | "stored";
  message: string;
  metadata?: Record<string, unknown>;
};

type GenerateQuizFromDocumentInput = QuizGenerationRequest & {
  userId: string;
};

type GeneratedQuizResult = {
  fromCache: boolean;
  cacheKey: string;
  quiz: GeneratedQuizPayload;
  quizRecordId: string;
  subject: {
    id: string;
    name: string;
    slug: string;
  };
  model: string;
};

type ProgressCallback = (event: QuizGenerationProgressEvent) => Promise<void> | void;

function createCacheKey(input: {
  subjectId: string;
  checksum: string;
  title: string;
  difficulty: string;
  questionCount: number;
  questionTypes: string[];
}): string {
  return createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
}

function buildRetrievalQuery(input: {
  subjectName: string;
  title: string;
  difficulty: string;
  questionTypes: string[];
}): string {
  return [
    input.subjectName,
    input.title,
    input.difficulty,
    input.questionTypes.join(" "),
    "study material concepts definitions examples exercises",
  ].join(" ");
}

export async function generateQuizFromDocument(
  input: GenerateQuizFromDocumentInput,
  onProgress: ProgressCallback,
): Promise<GeneratedQuizResult> {
  await onProgress({
    step: "received",
    message: "Upload recebido e validação concluída.",
  });

  const subject = await findSubjectById(input.subjectId);

  if (!subject) {
    throw new Error("Matéria não encontrada para geração do quiz.");
  }

  const parsedDocument = await parsePdfUpload(input.pdf);
  await onProgress({
    step: "parsed",
    message: "PDF convertido em texto.",
    metadata: {
      checksum: parsedDocument.checksum,
      fileName: parsedDocument.fileName,
    },
  });

  const cacheKey: string = createCacheKey({
    subjectId: input.subjectId,
    checksum: parsedDocument.checksum,
    title: input.title,
    difficulty: input.difficulty,
    questionCount: input.questionCount,
    questionTypes: input.questionTypes,
  });

  const cachedQuiz = await findCachedGeneratedQuiz(cacheKey);

  if (cachedQuiz) {
    await onProgress({
      step: "cached",
      message: "Quiz recuperado do cache.",
      metadata: {
        cacheKey,
        quizId: cachedQuiz.quiz.id,
      },
    });

    return {
      fromCache: true,
      cacheKey,
      quiz: generatedQuizPayloadSchema.parse(cachedQuiz.cache.responseJson),
      quizRecordId: cachedQuiz.quiz.id,
      subject: {
        id: cachedQuiz.quiz.subject.id,
        name: cachedQuiz.quiz.subject.name,
        slug: cachedQuiz.quiz.subject.slug,
      },
      model: cachedQuiz.cache.model,
    };
  }

  const textChunks = await chunkDocumentText(parsedDocument.rawText);
  await onProgress({
    step: "chunked",
    message: "Texto dividido em chunks para indexação.",
    metadata: {
      chunkCount: textChunks.length,
    },
  });

  const embeddedChunks = await embedDocumentChunks(textChunks);
  await onProgress({
    step: "embedded",
    message: "Embeddings gerados para os chunks do documento.",
    metadata: {
      chunkCount: embeddedChunks.length,
    },
  });

  const rankedChunks = await rankDocumentChunks(
    embeddedChunks,
    buildRetrievalQuery({
      subjectName: subject.name,
      title: input.title,
      difficulty: input.difficulty,
      questionTypes: input.questionTypes,
    }),
    8,
  );

  await onProgress({
    step: "retrieved",
    message: "Contexto mais relevante selecionado para o LLM.",
    metadata: {
      selectedChunks: rankedChunks.length,
    },
  });

  const generatedQuiz = await generateQuizWithLangChain({
    subjectName: subject.name,
    title: input.title,
    difficulty: input.difficulty,
    questionCount: input.questionCount,
    questionTypes: input.questionTypes,
    contextSnippets: rankedChunks.map((chunk) => chunk.content),
  });

  await onProgress({
    step: "generated",
    message: "Quiz gerado com LangChain e OpenAI.",
    metadata: {
      questionCount: generatedQuiz.quiz.questions.length,
      model: generatedQuiz.model,
    },
  });

  const persistedQuiz = await persistGeneratedQuiz({
    subjectId: input.subjectId,
    title: input.title,
    description: generatedQuiz.quiz.description,
    difficulty: input.difficulty,
    questionCount: input.questionCount,
    model: generatedQuiz.model,
    cacheKey,
    sourceDocument: parsedDocument,
    chunks: embeddedChunks,
    generatedQuiz: generatedQuiz.quiz,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  await onProgress({
    step: "stored",
    message: "Quiz persistido com documento-fonte, chunks e cache.",
    metadata: {
      quizId: persistedQuiz.id,
      cacheKey,
    },
  });

  return {
    fromCache: false,
    cacheKey,
    quiz: generatedQuiz.quiz,
    quizRecordId: persistedQuiz.id,
    subject: {
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
    },
    model: generatedQuiz.model,
  };
}
