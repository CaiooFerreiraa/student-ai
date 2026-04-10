export type QuizEntity = {
  id: string;
  subjectId: string;
  title: string;
  description: string | null;
  difficulty: string;
  totalQuestions: number;
  createdAt: Date;
  updatedAt: Date;
};
