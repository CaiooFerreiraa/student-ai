import type { AnalyticsFilters } from "@/application/validators/analytics-schemas";
import {
  getQuizDifficultyLabel,
  normalizeQuizDifficulty,
} from "@/domain/value-objects/quiz-difficulty";
import {
  findAnalyticsSourceData,
  findQuizRecommendation,
} from "@/infrastructure/repositories/prisma-analytics-repository";
import { isE2ETestMode } from "@/infrastructure/testing/e2e-mode";
import { getMockAnalyticsOverview } from "@/infrastructure/testing/mock-data";

type NamedAggregate = {
  key: string;
  label: string;
  attempts: number;
  accuracy: number;
  averageTimeMs: number;
};

function round(value: number): number {
  return Number(value.toFixed(1));
}

function formatTimelineKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getAnalyticsOverview(userId: string, filters: AnalyticsFilters) {
  if (isE2ETestMode()) {
    return getMockAnalyticsOverview(filters);
  }

  const { attempts, results } = await findAnalyticsSourceData(userId, filters);

  const summary = {
    totalSessions: results.length,
    averageScore: results.length
      ? round(results.reduce((total, result) => total + result.score, 0) / results.length)
      : 0,
    totalAttempts: attempts.length,
    totalCorrect: attempts.filter((attempt) => attempt.isCorrect === true).length,
    averageTimeMs: attempts.length
      ? Math.round(attempts.reduce((total, attempt) => total + attempt.timeSpentMs, 0) / attempts.length)
      : 0,
  };

  const aggregateNamed = (
    labelSelector: (attempt: (typeof attempts)[number]) => { key: string; label: string },
  ): NamedAggregate[] => {
    const map = new Map<string, { label: string; attempts: number; correct: number; totalTimeMs: number }>();

    for (const attempt of attempts) {
      const { key, label } = labelSelector(attempt);
      const current = map.get(key) ?? { label, attempts: 0, correct: 0, totalTimeMs: 0 };
      current.attempts += 1;
      current.correct += attempt.isCorrect === true ? 1 : 0;
      current.totalTimeMs += attempt.timeSpentMs;
      map.set(key, current);
    }

    return Array.from(map.entries())
      .map(([key, value]) => ({
        key,
        label: value.label,
        attempts: value.attempts,
        accuracy: value.attempts ? round((value.correct / value.attempts) * 100) : 0,
        averageTimeMs: value.attempts ? Math.round(value.totalTimeMs / value.attempts) : 0,
      }))
      .sort((left, right) => right.attempts - left.attempts);
  };

  const subjectBreakdown = aggregateNamed((attempt) => ({
    key: attempt.subject.id,
    label: attempt.subject.name,
  }));
  const difficultyBreakdown = aggregateNamed((attempt) => ({
    key: normalizeQuizDifficulty(attempt.difficulty) ?? attempt.difficulty,
    label: getQuizDifficultyLabel(attempt.difficulty),
  }));
  const questionTypeBreakdown = aggregateNamed((attempt) => ({
    key: attempt.questionType,
    label: attempt.questionType.replace("_", " "),
  }));
  const weakTopics = aggregateNamed((attempt) => ({
    key: attempt.topic ?? "sem-topico",
    label: attempt.topic ?? "Sem subtópico",
  }))
    .filter((item) => item.attempts >= 2)
    .sort((left, right) => left.accuracy - right.accuracy)
    .slice(0, 5);

  const timelineMap = new Map<
    string,
    { label: string; sessions: number; totalScore: number; correct: number; attempts: number }
  >();

  for (const result of results) {
    const key = formatTimelineKey(result.completedAt);
    const current = timelineMap.get(key) ?? { label: key, sessions: 0, totalScore: 0, correct: 0, attempts: 0 };
    current.sessions += 1;
    current.totalScore += result.score;
    current.correct += result.correctAnswers;
    current.attempts += result.totalQuestions;
    timelineMap.set(key, current);
  }

  const timeline = Array.from(timelineMap.values()).map((point) => ({
    label: point.label,
    averageScore: point.sessions ? round(point.totalScore / point.sessions) : 0,
    accuracy: point.attempts ? round((point.correct / point.attempts) * 100) : 0,
    sessions: point.sessions,
  }));

  const weakestSubject = [...subjectBreakdown]
    .filter((item) => item.attempts >= 2)
    .sort((left, right) => left.accuracy - right.accuracy)[0];
  const weakestDifficulty = [...difficultyBreakdown]
    .filter((item) => item.attempts >= 2)
    .sort((left, right) => left.accuracy - right.accuracy)[0];
  const recommendation = weakestSubject
    ? await findQuizRecommendation({
        subjectId: weakestSubject.key,
        difficulty: weakestDifficulty?.key,
      })
    : null;

  return {
    summary: {
      ...summary,
      accuracyRate: summary.totalAttempts ? round((summary.totalCorrect / summary.totalAttempts) * 100) : 0,
    },
    subjectBreakdown,
    difficultyBreakdown,
    questionTypeBreakdown,
    weakTopics,
    timeline,
    recommendation: recommendation
      ? {
          ...recommendation,
          reason: weakestSubject
            ? `Menor taxa de acerto recente em ${weakestSubject.label}${
                weakestDifficulty ? `, com mais fricção em ${weakestDifficulty.label}` : ""
              }.`
            : "Reforço sugerido com base no desempenho recente.",
        }
      : null,
  };
}
