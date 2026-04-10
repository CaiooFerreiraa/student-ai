import {
  generatedQuizPayloadSchema,
  quizGenerationRequestSchema,
  quizSubmissionSchema,
} from "@/application/validators/quiz-generation-schemas";

describe("quiz generation schemas", () => {
  it("parses multipart-like request payloads", () => {
    const file: File = new File(["fake pdf"], "biology.pdf", { type: "application/pdf" });

    const parsed = quizGenerationRequestSchema.parse({
      subjectId: "subject_123",
      title: "  Revisao de Biologia  ",
      difficulty: "ensino_superior",
      questionCount: "6",
      questionTypes: "multiple_choice,true_false,essay",
      pdf: file,
    });

    expect(parsed.title).toBe("Revisao de Biologia");
    expect(parsed.questionCount).toBe(6);
    expect(parsed.questionTypes).toEqual(["multiple_choice", "true_false", "essay"]);
  });

  it("rejects non-pdf uploads", () => {
    const file: File = new File(["text"], "notes.txt", { type: "text/plain" });

    const parsed = quizGenerationRequestSchema.safeParse({
      subjectId: "subject_123",
      title: "Revisao",
      difficulty: "ensino_superior",
      questionCount: 6,
      questionTypes: ["multiple_choice"],
      pdf: file,
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts generated quiz payloads with mixed question types", () => {
    const parsed = generatedQuizPayloadSchema.parse({
      title: "Quiz de Historia",
      description: "Questoes baseadas no material enviado.",
      questions: [
        {
          type: "multiple_choice",
          difficulty: "ensino_medio",
          topic: "Descobrimento",
          prompt: "Quem chegou ao Brasil em 1500?",
          options: ["Cabral", "Dom Pedro", "Tiradentes", "Getulio"],
          answer: {
            correctOption: 0,
          },
          explanation: "Pedro Alvares Cabral liderou a expedicao de 1500.",
        },
        {
          type: "true_false",
          difficulty: "ensino_superior",
          topic: "Cronologia",
          prompt: "A Revolucao Francesa ocorreu antes da Independencia do Brasil.",
          options: ["True", "False"],
          answer: {
            correct: true,
          },
          explanation: "A Revolucao Francesa comecou em 1789 e a Independencia do Brasil ocorreu em 1822.",
        },
        {
          type: "essay",
          difficulty: "concurso",
          topic: "Revolucao Industrial",
          prompt: "Explique os impactos politicos da Revolucao Industrial.",
          options: null,
          answer: {
            sampleAnswer: "A Revolucao Industrial reorganizou o trabalho, fortaleceu a burguesia e pressionou por novas reformas politicas.",
            keyPoints: ["urbanizacao", "burguesia", "trabalho fabril"],
          },
          explanation: "A resposta deve relacionar economia, sociedade e politica.",
        },
      ],
    });

    expect(parsed.questions).toHaveLength(3);
    expect(parsed.questions[0]?.topic).toBe("Descobrimento");
  });

  it("accepts quiz submission payload with tracked attempts", () => {
    const parsed = quizSubmissionSchema.parse({
      quizId: "quiz_123",
      score: 80,
      correctAnswers: 4,
      totalQuestions: 5,
      attempts: [
        {
          questionId: "question_1",
          sessionOrder: 0,
          questionType: "multiple_choice",
          difficulty: "ensino_medio",
          topic: "Citologia",
          isCorrect: true,
          timeSpentMs: 18500,
          selectedOption: 2,
          answerText: null,
        },
      ],
    });

    expect(parsed.attempts).toHaveLength(1);
    expect(parsed.attempts[0]?.topic).toBe("Citologia");
  });
});
