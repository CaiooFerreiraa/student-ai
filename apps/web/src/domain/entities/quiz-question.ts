export type QuizQuestionEntity = {
  id: string;
  quizId: string;
  position: number;
  type: string;
  difficulty: string;
  prompt: string;
  options: string[] | null;
  answer: unknown;
  explanation: string | null;
  createdAt: Date;
};
