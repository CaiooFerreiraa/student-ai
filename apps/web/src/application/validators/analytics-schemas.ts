import { z } from "zod";
import { quizDifficultySchema, quizQuestionTypeSchema } from "@/application/validators/quiz-generation-schemas";
import { sanitizeString } from "@/infrastructure/security/sanitize";

export const analyticsPeriodValues = ["7d", "30d", "90d", "365d", "all"] as const;

export const analyticsPeriodSchema = z.enum(analyticsPeriodValues);

function emptyStringToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value;
}

export const analyticsFiltersSchema = z.object({
  period: analyticsPeriodSchema.default("30d"),
  subjectId: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .transform(sanitizeString)
      .pipe(z.string().min(1).max(64))
      .optional(),
  ),
  difficulty: z.preprocess(emptyStringToUndefined, quizDifficultySchema.optional()),
  questionType: z.preprocess(emptyStringToUndefined, quizQuestionTypeSchema.optional()),
  from: z.preprocess(emptyStringToUndefined, z.iso.date().optional()),
  to: z.preprocess(emptyStringToUndefined, z.iso.date().optional()),
});

export const analyticsQuerySchema = z.object({
  period: z.preprocess(emptyStringToUndefined, analyticsPeriodSchema.optional()),
  subjectId: z.preprocess(emptyStringToUndefined, z.string().optional()),
  difficulty: z.preprocess(emptyStringToUndefined, z.string().optional()),
  questionType: z.preprocess(emptyStringToUndefined, z.string().optional()),
  from: z.preprocess(emptyStringToUndefined, z.string().optional()),
  to: z.preprocess(emptyStringToUndefined, z.string().optional()),
});

export const paginatedHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
  period: z.preprocess(emptyStringToUndefined, analyticsPeriodSchema.optional()),
  subjectId: z.preprocess(emptyStringToUndefined, z.string().optional()),
  difficulty: z.preprocess(emptyStringToUndefined, z.string().optional()),
  questionType: z.preprocess(emptyStringToUndefined, z.string().optional()),
  from: z.preprocess(emptyStringToUndefined, z.string().optional()),
  to: z.preprocess(emptyStringToUndefined, z.string().optional()),
});

export const sessionReportParamsSchema = z.object({
  resultId: z.string().trim().min(1),
});

export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>;
export type PaginatedHistoryQuery = z.infer<typeof paginatedHistoryQuerySchema>;
