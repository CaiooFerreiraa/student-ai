import type { AnalyticsFilters } from "@/application/validators/analytics-schemas";
import type { QuizGenerationRequest, GeneratedQuizPayload } from "@/application/validators/quiz-generation-schemas";
import type { QuizGenerationProgressEvent } from "@/application/use-cases/generate-quiz-from-document";
import type { QuizPlaybackData } from "@/application/use-cases/get-quiz-playback";

export const e2eUser = {
  id: "e2e-user-1",
  name: "E2E Student",
  email: "e2e@example.com",
};

export const e2eSubjects = [
  {
    id: "subject-math",
    name: "Matemática",
    slug: "matematica",
    description: "Álgebra, funções e revisão operacional.",
  },
  {
    id: "subject-const",
    name: "Direito Constitucional",
    slug: "direito-constitucional",
    description: "Princípios, controle de constitucionalidade e direitos fundamentais.",
  },
];

export const e2eQuizPlayback: QuizPlaybackData = {
  id: "e2e-generated-quiz",
  title: "Quiz de Revisão Guiada",
  description: "Quiz de teste para fluxo E2E sem dependência de banco ou LLM.",
  difficulty: "ensino_superior",
  totalQuestions: 3,
  isDemo: false,
  subject: {
    id: e2eSubjects[0].id,
    name: e2eSubjects[0].name,
    slug: e2eSubjects[0].slug,
  },
  questions: [
    {
      id: "e2e-q1",
      type: "multiple_choice",
      difficulty: "ensino_medio",
      topic: "Equações",
      prompt: "Qual é o valor de x em 2x = 10?",
      options: ["2", "5", "10", "20"],
      explanation: "Ao dividir os dois lados por 2, x = 5.",
      answer: {
        correctOption: 1,
      },
    },
    {
      id: "e2e-q2",
      type: "true_false",
      difficulty: "ensino_superior",
      topic: "Funções",
      prompt: "Uma função do primeiro grau tem expoente máximo igual a 1.",
      options: ["True", "False"],
      explanation: "Essa é a característica central da função afim.",
      answer: {
        correct: true,
      },
    },
    {
      id: "e2e-q3",
      type: "essay",
      difficulty: "concurso",
      topic: "Revisão ativa",
      prompt: "Explique como a revisão ativa ajuda a consolidar aprendizado em matemática.",
      options: null,
      explanation: "A resposta deve articular recuperação ativa e correção de erros.",
      answer: {
        sampleAnswer: "Revisão ativa exige recuperar o conteúdo sem apoio direto, o que fortalece memória e identifica lacunas.",
        keyPoints: ["recuperação ativa", "correção de erros", "retenção"],
      },
    },
  ],
};

export function getMockDashboardOverview() {
  return {
    metrics: {
      subjects: e2eSubjects.length,
      quizzes: 4,
      results: 7,
    },
    subjects: e2eSubjects,
    quizzes: [
      {
        id: "e2e-generated-quiz",
        title: "Quiz de Revisão Guiada",
        description: "Treino rápido com múltipla escolha, verdadeiro/falso e dissertativa.",
        difficulty: "ensino_superior",
        updatedAt: new Date("2026-04-10T10:00:00.000Z"),
        subject: e2eSubjects[0],
        questions: e2eQuizPlayback.questions,
        _count: {
          results: 7,
        },
      },
    ],
    history: [
      {
        id: "result-e2e-1",
        score: 82,
        correctAnswers: 9,
        totalQuestions: 11,
        completedAt: new Date("2026-04-10T09:00:00.000Z"),
        quiz: {
          id: "e2e-generated-quiz",
          title: "Quiz de Revisão Guiada",
          difficulty: "ensino_superior",
          subject: {
            name: e2eSubjects[0].name,
          },
        },
      },
    ],
  };
}

export function getMockAnalyticsOverview(filters: AnalyticsFilters) {
  void filters;

  return {
    summary: {
      totalSessions: 7,
      averageScore: 78.4,
      totalAttempts: 41,
      totalCorrect: 30,
      averageTimeMs: 18500,
      accuracyRate: 73.2,
    },
    subjectBreakdown: [
      { key: e2eSubjects[0].id, label: e2eSubjects[0].name, attempts: 25, accuracy: 76, averageTimeMs: 16200 },
      { key: e2eSubjects[1].id, label: e2eSubjects[1].name, attempts: 16, accuracy: 68, averageTimeMs: 22100 },
    ],
    difficultyBreakdown: [
      { key: "ensino_medio", label: "Ensino médio", attempts: 14, accuracy: 85, averageTimeMs: 11200 },
      { key: "ensino_superior", label: "Ensino superior", attempts: 18, accuracy: 72, averageTimeMs: 17800 },
      { key: "concurso", label: "Concurso", attempts: 9, accuracy: 55, averageTimeMs: 29400 },
    ],
    questionTypeBreakdown: [
      { key: "multiple_choice", label: "multiple choice", attempts: 18, accuracy: 81, averageTimeMs: 9800 },
      { key: "true_false", label: "true false", attempts: 11, accuracy: 73, averageTimeMs: 7600 },
      { key: "essay", label: "essay", attempts: 12, accuracy: 0, averageTimeMs: 34100 },
    ],
    weakTopics: [
      { key: "controle", label: "Controle difuso", attempts: 4, accuracy: 50, averageTimeMs: 21000 },
      { key: "proporcao", label: "Proporção", attempts: 3, accuracy: 66.7, averageTimeMs: 18300 },
    ],
    timeline: [
      { label: "2026-04-08", averageScore: 72, accuracy: 69, sessions: 2 },
      { label: "2026-04-09", averageScore: 77, accuracy: 72, sessions: 2 },
      { label: "2026-04-10", averageScore: 86, accuracy: 79, sessions: 3 },
    ],
    recommendation: {
      id: "e2e-generated-quiz",
      title: "Quiz de Revisão Guiada",
      difficulty: "concurso",
      totalQuestions: 3,
      subject: {
        id: e2eSubjects[1].id,
        name: e2eSubjects[1].name,
        slug: e2eSubjects[1].slug,
      },
      reason: "Menor taxa de acerto recente em Direito Constitucional, com mais fricção em concurso.",
    },
  };
}

export function getMockPaginatedHistory() {
  return {
    items: [
      {
        id: "result-e2e-1",
        score: 82,
        correctAnswers: 9,
        totalQuestions: 11,
        completedAt: new Date("2026-04-10T09:00:00.000Z"),
        quiz: {
          id: "e2e-generated-quiz",
          title: "Quiz de Revisão Guiada",
          difficulty: "ensino_superior",
          subject: e2eSubjects[0],
        },
        questionAttempts: [
          {
            questionType: "multiple_choice",
            difficulty: "ensino_superior",
            topic: "Equações",
            isCorrect: false,
            timeSpentMs: 16200,
          },
          {
            questionType: "essay",
            difficulty: "concurso",
            topic: "Revisão ativa",
            isCorrect: null,
            timeSpentMs: 29200,
          },
        ],
      },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };
}

export function getMockSessionReport() {
  return {
    id: "result-e2e-1",
    score: 82,
    correctAnswers: 9,
    totalQuestions: 11,
    completedAt: "2026-04-10T09:00:00.000Z",
    quiz: {
      title: "Quiz de Revisão Guiada",
      difficulty: "ensino_superior",
      subject: {
        name: e2eSubjects[0].name,
      },
    },
    questionAttempts: [
      {
        sessionOrder: 0,
        questionType: "multiple_choice",
        difficulty: "ensino_superior",
        topic: "Equações",
        isCorrect: false,
        timeSpentMs: 16200,
        answerText: null,
        question: {
          prompt: "Qual é o valor de x em 2x = 10?",
          explanation: "Ao dividir os dois lados por 2, x = 5.",
        },
      },
    ],
  };
}

export function getMockGeneratedQuizResult(input: QuizGenerationRequest): {
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
  progress: QuizGenerationProgressEvent[];
} {
  const questions: GeneratedQuizPayload["questions"] = e2eQuizPlayback.questions.map((question) => {
    const difficulty = question.difficulty as GeneratedQuizPayload["questions"][number]["difficulty"];

    if (question.type === "multiple_choice") {
      return {
        type: "multiple_choice",
        difficulty,
        topic: question.topic,
        prompt: question.prompt,
        options: question.options,
        answer: question.answer,
        explanation: question.explanation,
      };
    }

    if (question.type === "true_false") {
      return {
        type: "true_false",
        difficulty,
        topic: question.topic,
        prompt: question.prompt,
        options: question.options,
        answer: question.answer,
        explanation: question.explanation,
      };
    }

    return {
      type: "essay",
      difficulty,
      topic: question.topic,
      prompt: question.prompt,
      options: null,
      answer: question.answer,
      explanation: question.explanation,
    };
  });

  return {
    fromCache: false,
    cacheKey: "e2e-cache-key",
    quizRecordId: e2eQuizPlayback.id,
    subject: {
      id: input.subjectId,
      name: e2eSubjects.find((subject) => subject.id === input.subjectId)?.name ?? e2eSubjects[0].name,
      slug: e2eSubjects.find((subject) => subject.id === input.subjectId)?.slug ?? e2eSubjects[0].slug,
    },
    model: "gpt-5.4-mini",
    quiz: {
      title: input.title,
      description: "Quiz E2E gerado de forma determinística para validar o fluxo crítico.",
      questions,
    },
    progress: [
      { step: "received", message: "Upload recebido e validação concluída." },
      { step: "parsed", message: "PDF convertido em texto." },
      { step: "generated", message: "Quiz E2E gerado." },
      { step: "stored", message: "Quiz mockado pronto para uso." },
    ],
  };
}
