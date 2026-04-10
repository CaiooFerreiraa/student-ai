export type ResultEntity = {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: Date;
};
