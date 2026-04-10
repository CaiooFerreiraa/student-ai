import { z } from "zod";
import {
  quizDifficultyValues,
  type QuizDifficulty,
} from "@/domain/value-objects/quiz-difficulty";
import { sanitizeString } from "@/infrastructure/security/sanitize";

export const quizQuestionTypeValues = ["multiple_choice", "true_false", "essay"] as const;

export const quizDifficultySchema = z.enum(quizDifficultyValues);
export const quizQuestionTypeSchema = z.enum(quizQuestionTypeValues);

function parseQuestionTypes(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const sanitizedValue: string = sanitizeString(value);

  if (sanitizedValue.startsWith("[")) {
    try {
      return JSON.parse(sanitizedValue);
    } catch {
      return sanitizedValue;
    }
  }

  return sanitizedValue.split(",").map((item: string) => sanitizeString(item));
}

const pdfFileSchema = z
  .custom<File>((value: unknown): value is File => typeof File !== "undefined" && value instanceof File, {
    message: "PDF file is required.",
  })
  .refine((file: File) => file.size > 0, "Uploaded PDF is empty.")
  .refine(
    (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"),
    "Only PDF files are allowed.",
  );

export const quizGenerationRequestSchema = z.object({
  subjectId: z.string().trim().min(1),
  title: z.string().transform(sanitizeString).pipe(z.string().min(3).max(120)),
  difficulty: quizDifficultySchema,
  questionCount: z.coerce.number().int().min(3).max(20),
  questionTypes: z.preprocess(
    parseQuestionTypes,
    z.array(quizQuestionTypeSchema).min(1).max(3),
  ),
  pdf: pdfFileSchema,
});

export const contextPreviewRequestSchema = z.object({
  subjectId: z.string().trim().min(1),
  pdf: pdfFileSchema,
});

const quizQuestionBaseSchema = z.object({
  type: quizQuestionTypeSchema,
  difficulty: quizDifficultySchema,
  topic: z
    .string()
    .transform(sanitizeString)
    .pipe(z.string().min(2).max(120))
    .nullable()
    .optional(),
  prompt: z.string().transform(sanitizeString).pipe(z.string().min(10).max(2000)),
  explanation: z
    .string()
    .transform(sanitizeString)
    .pipe(z.string().min(10).max(2000))
    .nullable()
    .optional(),
});

const multipleChoiceQuestionSchema = quizQuestionBaseSchema.extend({
  type: z.literal("multiple_choice"),
  options: z.array(z.string().transform(sanitizeString).pipe(z.string().min(1).max(280))).length(4),
  answer: z.object({
    correctOption: z.number().int().min(0).max(3),
  }),
});

const trueFalseQuestionSchema = quizQuestionBaseSchema.extend({
  type: z.literal("true_false"),
  options: z
    .array(z.string().transform(sanitizeString).pipe(z.string().min(1).max(20)))
    .length(2)
    .default(["True", "False"]),
  answer: z.object({
    correct: z.boolean(),
  }),
});

const essayQuestionSchema = quizQuestionBaseSchema.extend({
  type: z.literal("essay"),
  options: z.null().optional(),
  answer: z.object({
    sampleAnswer: z.string().transform(sanitizeString).pipe(z.string().min(20).max(4000)),
    keyPoints: z.array(z.string().transform(sanitizeString).pipe(z.string().min(2).max(240))).min(2).max(8),
  }),
});

export const generatedQuizQuestionSchema = z.discriminatedUnion("type", [
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  essayQuestionSchema,
]);

export const generatedQuizPayloadSchema = z.object({
  title: z.string().transform(sanitizeString).pipe(z.string().min(3).max(160)),
  description: z.string().transform(sanitizeString).pipe(z.string().min(10).max(1200)),
  questions: z.array(generatedQuizQuestionSchema).min(3).max(20),
});

export const quizSubmissionSchema = z.object({
  quizId: z.string().trim().min(1),
  score: z.coerce.number().min(0).max(100),
  correctAnswers: z.coerce.number().int().min(0),
  totalQuestions: z.coerce.number().int().min(1),
  attempts: z
    .array(
      z.object({
        questionId: z.string().trim().min(1),
        sessionOrder: z.coerce.number().int().min(0).max(200),
        questionType: quizQuestionTypeSchema,
        difficulty: quizDifficultySchema,
        topic: z
          .string()
          .transform(sanitizeString)
          .pipe(z.string().min(2).max(120))
          .nullable()
          .optional(),
        isCorrect: z.boolean().nullable(),
        timeSpentMs: z.coerce.number().int().min(0).max(1000 * 60 * 60),
        selectedOption: z.coerce.number().int().min(0).max(20).nullable().optional(),
        answerText: z
          .string()
          .transform(sanitizeString)
          .pipe(z.string().min(1).max(4000))
          .nullable()
          .optional(),
      }),
    )
    .min(1)
    .max(50),
});

export type QuizGenerationRequest = z.infer<typeof quizGenerationRequestSchema>;
export type GeneratedQuizPayload = z.infer<typeof generatedQuizPayloadSchema>;
export type GeneratedQuizQuestion = z.infer<typeof generatedQuizQuestionSchema>;
export type ContextPreviewRequest = z.infer<typeof contextPreviewRequestSchema>;
export type QuizSubmissionRequest = z.infer<typeof quizSubmissionSchema>;
export type { QuizDifficulty };
