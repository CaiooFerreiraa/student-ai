import { findQuizById } from "@/infrastructure/repositories/prisma-quiz-browser-repository";
import { isE2ETestMode } from "@/infrastructure/testing/e2e-mode";
import { e2eQuizPlayback } from "@/infrastructure/testing/mock-data";

export type QuizPlaybackQuestion =
  | {
      id: string;
      type: "multiple_choice";
      difficulty: string;
      topic: string | null;
      prompt: string;
      options: string[];
      explanation: string | null;
      answer: {
        correctOption: number;
      };
    }
  | {
      id: string;
      type: "true_false";
      difficulty: string;
      topic: string | null;
      prompt: string;
      options: string[];
      explanation: string | null;
      answer: {
        correct: boolean;
      };
    }
  | {
      id: string;
      type: "essay";
      difficulty: string;
      topic: string | null;
      prompt: string;
      options: null;
      explanation: string | null;
      answer: {
        sampleAnswer: string;
        keyPoints: string[];
      };
    };

export type QuizPlaybackData = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  totalQuestions: number;
  isDemo: boolean;
  subject: {
    id: string;
    name: string;
    slug: string;
  };
  questions: QuizPlaybackQuestion[];
};

const demoQuizPlayback: QuizPlaybackData = {
  id: "demo",
  title: "Ritmo de Estudo e Revisão Ativa",
  description: "Quiz demonstrativo do fluxo de resolução com feedback imediato e timer.",
  difficulty: "ensino_superior",
  totalQuestions: 3,
  isDemo: true,
  subject: {
    id: "demo-subject",
    name: "Metodologia de Estudo",
    slug: "metodologia-de-estudo",
  },
  questions: [
    {
      id: "demo-q1",
      type: "multiple_choice",
      difficulty: "ensino_medio",
      topic: "Pomodoro",
      prompt: "Qual técnica alterna blocos de foco com intervalos curtos de descanso?",
      options: ["Pomodoro", "Leitura dinâmica", "Mapeamento mental", "Shadowing"],
      explanation: "O método Pomodoro organiza sessões curtas e repetidas com pausas entre elas.",
      answer: {
        correctOption: 0,
      },
    },
    {
      id: "demo-q2",
      type: "true_false",
      difficulty: "ensino_superior",
      topic: "Revisão espaçada",
      prompt: "Revisão espaçada ajuda a consolidar memória no longo prazo.",
      options: ["True", "False"],
      explanation: "A repetição espaçada distribui revisões ao longo do tempo e melhora retenção.",
      answer: {
        correct: true,
      },
    },
    {
      id: "demo-q3",
      type: "essay",
      difficulty: "doutorado",
      topic: "Planejamento semanal",
      prompt: "Descreva como você combinaria revisão ativa e prática deliberada em uma semana de estudos.",
      options: null,
      explanation: "A resposta deve articular rotina, revisão espaçada e correção de lacunas.",
      answer: {
        sampleAnswer:
          "Eu dividiria a semana entre estudo inicial, revisão ativa em cartões e exercícios corrigidos com foco nos erros recorrentes.",
        keyPoints: ["planejamento semanal", "revisão ativa", "correção de erros"],
      },
    },
  ],
};

export async function getQuizPlayback(quizId: string): Promise<QuizPlaybackData | null> {
  if (quizId === "demo") {
    return demoQuizPlayback;
  }

  if (isE2ETestMode() && quizId === e2eQuizPlayback.id) {
    return e2eQuizPlayback;
  }

  const quiz = await findQuizById(quizId);

  if (!quiz) {
    return null;
  }

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    difficulty: quiz.difficulty,
    totalQuestions: quiz.totalQuestions,
    isDemo: false,
    subject: {
      id: quiz.subject.id,
      name: quiz.subject.name,
      slug: quiz.subject.slug,
    },
    questions: quiz.questions.map((question) => {
      if (question.type === "multiple_choice") {
        return {
          id: question.id,
          type: "multiple_choice" as const,
          difficulty: question.difficulty,
          topic: question.topic ?? null,
          prompt: question.prompt,
          options: Array.isArray(question.options) ? (question.options as string[]) : [],
          explanation: question.explanation,
          answer: question.answer as { correctOption: number },
        };
      }

      if (question.type === "true_false") {
        return {
          id: question.id,
          type: "true_false" as const,
          difficulty: question.difficulty,
          topic: question.topic ?? null,
          prompt: question.prompt,
          options: Array.isArray(question.options) ? (question.options as string[]) : ["True", "False"],
          explanation: question.explanation,
          answer: question.answer as { correct: boolean },
        };
      }

      return {
        id: question.id,
        type: "essay" as const,
        difficulty: question.difficulty,
        topic: question.topic ?? null,
        prompt: question.prompt,
        options: null,
        explanation: question.explanation,
        answer: question.answer as { sampleAnswer: string; keyPoints: string[] },
      };
    }),
  };
}
