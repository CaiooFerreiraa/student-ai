export type GeneratedQuizCacheEntity = {
  id: string;
  cacheKey: string;
  subjectId: string;
  quizId: string | null;
  sourceChecksum: string;
  model: string;
  difficulty: string;
  questionCount: number;
  questionTypes: string[];
  responseJson: unknown;
  createdAt: Date;
  expiresAt: Date;
};
