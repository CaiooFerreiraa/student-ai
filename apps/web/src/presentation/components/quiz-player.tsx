"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Clock3, LoaderCircle, MoveRight } from "lucide-react";
import { toast } from "sonner";
import type { QuizPlaybackData, QuizPlaybackQuestion } from "@/application/use-cases/get-quiz-playback";
import { getQuizDifficultyLabel } from "@/domain/value-objects/quiz-difficulty";

type QuizPlayerProps = {
  quiz: QuizPlaybackData;
};

type SubmissionResponse = {
  id: string;
  completedAt: string;
};

type QuestionAttemptPayload = {
  questionId: string;
  sessionOrder: number;
  questionType: QuizPlaybackQuestion["type"];
  difficulty: string;
  topic: string | null;
  isCorrect: boolean | null;
  timeSpentMs: number;
  selectedOption?: number | null;
  answerText?: string | null;
};

type AnswerState = {
  multipleChoice?: number;
  trueFalse?: boolean;
  essay?: string;
};

type FeedbackState = {
  tone: "success" | "warning" | "neutral";
  message: string;
};

function buildFeedback(question: QuizPlaybackQuestion, answer: AnswerState): FeedbackState {
  if (question.type === "multiple_choice") {
    const isCorrect: boolean = answer.multipleChoice === question.answer.correctOption;
    return {
      tone: isCorrect ? "success" : "warning",
      message: isCorrect
        ? "Resposta correta. Continue no mesmo ritmo."
        : `Resposta incorreta. Revise a explicação antes de seguir.`,
    };
  }

  if (question.type === "true_false") {
    const isCorrect: boolean = answer.trueFalse === question.answer.correct;
    return {
      tone: isCorrect ? "success" : "warning",
      message: isCorrect ? "Afirmação avaliada corretamente." : "Afirmação marcada de forma incorreta.",
    };
  }

  return {
    tone: "neutral",
    message: "Resposta dissertativa registrada. Compare com os pontos-chave ao final.",
  };
}

function calculateScore(quiz: QuizPlaybackData, answers: AnswerState[]): { score: number; correctAnswers: number } {
  const autoGradableQuestions = quiz.questions.filter((question: QuizPlaybackQuestion) => question.type !== "essay");
  const correctAnswers: number = quiz.questions.reduce((total: number, question: QuizPlaybackQuestion, index: number) => {
    const answer = answers[index];

    if (question.type === "multiple_choice" && answer?.multipleChoice === question.answer.correctOption) {
      return total + 1;
    }

    if (question.type === "true_false" && answer?.trueFalse === question.answer.correct) {
      return total + 1;
    }

    return total;
  }, 0);

  if (autoGradableQuestions.length === 0) {
    return {
      score: 100,
      correctAnswers: 0,
    };
  }

  return {
    score: Math.round((correctAnswers / autoGradableQuestions.length) * 100),
    correctAnswers,
  };
}

function evaluateAnswer(question: QuizPlaybackQuestion, answer: AnswerState): boolean | null {
  if (question.type === "multiple_choice") {
    return answer.multipleChoice === question.answer.correctOption;
  }

  if (question.type === "true_false") {
    return answer.trueFalse === question.answer.correct;
  }

  return null;
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(quiz.totalQuestions * 75);
  const [answers, setAnswers] = useState<AnswerState[]>(Array.from({ length: quiz.questions.length }, () => ({})));
  const [feedbackByIndex, setFeedbackByIndex] = useState<Record<number, FeedbackState>>({});
  const [attemptsByIndex, setAttemptsByIndex] = useState<Record<number, QuestionAttemptPayload>>({});
  const questionStartedAtRef = useRef<number>(0);

  const currentQuestion: QuizPlaybackQuestion = quiz.questions[currentIndex];
  const progressPercentage: number = ((currentIndex + 1) / quiz.questions.length) * 100;

  useEffect(() => {
    questionStartedAtRef.current = Date.now();
    const timer = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    questionStartedAtRef.current = Date.now();
  }, [currentIndex]);

  const submitMutation = useMutation<
    SubmissionResponse,
    Error,
    { score: number; correctAnswers: number; attempts: QuestionAttemptPayload[] }
  >({
    mutationFn: async (values: {
      score: number;
      correctAnswers: number;
      attempts: QuestionAttemptPayload[];
    }): Promise<SubmissionResponse> => {
      const response = await fetch(`/api/quiz/${quiz.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz.id,
          score: values.score,
          correctAnswers: values.correctAnswers,
          totalQuestions: quiz.totalQuestions,
          attempts: values.attempts,
        }),
      });

      const json = (await response.json()) as SubmissionResponse | { error: string };

      if (!response.ok || "error" in json) {
        throw new Error("error" in json ? json.error : "Falha ao registrar resultado.");
      }

      return json;
    },
    onMutate: () => toast.loading("Registrando resultado...", { id: "quiz-submit" }),
    onSuccess: () => {
      toast.success("Resultado salvo no histórico.", { id: "quiz-submit" });
      router.push("/history");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message, { id: "quiz-submit" }),
  });

  const timerLabel: string = useMemo(() => {
    const minutes: number = Math.floor(secondsRemaining / 60);
    const seconds: number = secondsRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsRemaining]);

  const updateAnswer = (partial: AnswerState): void => {
    setAnswers((currentAnswers: AnswerState[]) =>
      currentAnswers.map((answer: AnswerState, index: number) =>
        index === currentIndex ? { ...answer, ...partial } : answer,
      ),
    );
  };

  const handleAdvance = (): void => {
    const currentAnswer: AnswerState = answers[currentIndex] ?? {};
    const feedback: FeedbackState = buildFeedback(currentQuestion, currentAnswer);
    const timeSpentMs = Math.max(0, Date.now() - questionStartedAtRef.current);
    const isCorrect = evaluateAnswer(currentQuestion, currentAnswer);
    const nextAttempt: QuestionAttemptPayload = {
      questionId: currentQuestion.id,
      sessionOrder: currentIndex,
      questionType: currentQuestion.type,
      difficulty: currentQuestion.difficulty,
      topic: currentQuestion.topic,
      isCorrect,
      timeSpentMs,
      selectedOption:
        currentQuestion.type === "multiple_choice"
          ? currentAnswer.multipleChoice ?? null
          : currentQuestion.type === "true_false"
            ? currentAnswer.trueFalse === undefined
              ? null
              : currentAnswer.trueFalse
                ? 1
                : 0
            : null,
      answerText: currentQuestion.type === "essay" ? currentAnswer.essay?.trim() ?? null : null,
    };

    setFeedbackByIndex((current) => ({
      ...current,
      [currentIndex]: feedback,
    }));
    setAttemptsByIndex((current) => ({
      ...current,
      [currentIndex]: nextAttempt,
    }));

    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((current) => current + 1);
      return;
    }

    const result = calculateScore(quiz, answers);
    const attemptsPayload = [...Object.values(attemptsByIndex), nextAttempt].sort(
      (left, right) => left.sessionOrder - right.sessionOrder,
    );

    if (quiz.isDemo) {
      toast.success(`Demo concluído com ${result.score}% de aproveitamento.`);
      router.push("/dashboard");
      return;
    }

    submitMutation.mutate({
      ...result,
      attempts: attemptsPayload,
    });
  };

  const currentFeedback: FeedbackState | undefined = feedbackByIndex[currentIndex];

  return (
    <div className="grid gap-5 2xl:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="ui-panel-cut ui-surface-noise space-y-5 px-5 py-5 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3 2xl:grid-cols-1">
          <div>
            <p className="ui-label mb-0">Progresso</p>
            <p className="mt-3 font-[var(--font-display)] text-[2.6rem] font-extrabold uppercase leading-none tracking-[-0.08em] text-ink">
              {currentIndex + 1}/{quiz.questions.length}
            </p>
          </div>
          <div className="sm:col-span-2 2xl:col-span-1">
            <div className="overflow-hidden rounded-full bg-ink/8">
              <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${progressPercentage}%` }} />
            </div>
            <div className="ui-card mt-4 p-4">
              <p className="ui-label mb-0">Timer</p>
              <p className="mt-3 inline-flex items-center gap-3 font-[var(--font-display)] text-[2rem] font-extrabold tracking-[-0.08em] text-ink">
                <Clock3 className="h-5 w-5 text-accent" />
                {timerLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-ink/10 bg-white/55 p-4 text-sm leading-7 text-ink-soft">
          Responda cada questão e avance com feedback imediato. As respostas dissertativas ficam registradas para revisão posterior.
        </div>
      </aside>

      <section className="ui-panel-cut px-5 py-5 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="ui-badge">{quiz.subject.name}</span>
              <span className="ui-badge">{getQuizDifficultyLabel(currentQuestion.difficulty)}</span>
              <span className="ui-badge">{currentQuestion.type.replace("_", " ")}</span>
              {currentQuestion.topic ? <span className="ui-badge">{currentQuestion.topic}</span> : null}
            </div>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-ink-soft">
              Questão {currentIndex + 1}
            </p>
            <h2 className="ui-reading-title mt-3">
              {currentQuestion.prompt}
            </h2>
          </div>
          {quiz.isDemo ? (
            <span className="ui-badge border-accent/25 bg-accent-soft/50 text-accent">Demo</span>
          ) : null}
        </div>

        <div className="mt-8 space-y-4">
          {currentQuestion.type === "multiple_choice"
            ? currentQuestion.options.map((option: string, index: number) => {
                const selected: boolean = answers[currentIndex]?.multipleChoice === index;

                return (
                  <button
                    className={`ui-option-card flex items-start justify-between gap-4 ${
                      selected
                        ? "border-accent bg-accent-soft/45 shadow-[0_16px_35px_rgba(164,73,28,0.12)]"
                        : "hover:-translate-y-0.5 hover:bg-white/88"
                    }`}
                    key={option}
                    onClick={() => updateAnswer({ multipleChoice: index })}
                    type="button"
                  >
                    <div className="min-w-0">
                      <span className="block text-[16px] leading-8 text-ink sm:text-[17px]">{option}</span>
                    </div>
                    <span className="ui-badge shrink-0">{String.fromCharCode(65 + index)}</span>
                  </button>
                );
              })
            : null}

          {currentQuestion.type === "true_false" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {currentQuestion.options.map((option: string) => {
                const boolValue: boolean = option.toLowerCase() === "true";
                const selected: boolean = answers[currentIndex]?.trueFalse === boolValue;

                return (
                  <button
                    className={`ui-option-card px-5 py-6 ${
                      selected
                        ? "border-accent bg-accent-soft/45 shadow-[0_16px_35px_rgba(164,73,28,0.12)]"
                        : "hover:-translate-y-0.5 hover:bg-white/88"
                    }`}
                    key={option}
                    onClick={() => updateAnswer({ trueFalse: boolValue })}
                    type="button"
                  >
                    <p className="font-[var(--font-display)] text-[2rem] font-bold uppercase tracking-[-0.08em] text-ink">
                      {option}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {currentQuestion.type === "essay" ? (
            <div className="space-y-4">
              <textarea
                className="ui-textarea min-h-40"
                onChange={(event) => updateAnswer({ essay: event.target.value })}
                placeholder="Escreva sua resposta de forma objetiva e estruturada."
                value={answers[currentIndex]?.essay ?? ""}
              />
              <div className="rounded-[1.4rem] border border-ink/10 bg-white/60 p-4">
                <p className="ui-label mb-0">Pontos-chave esperados</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentQuestion.answer.keyPoints.map((point) => (
                    <span className="ui-badge" key={point}>
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {currentFeedback ? (
          <div
            className={`mt-6 rounded-[1.5rem] border px-5 py-4 text-[15px] leading-7 ${
              currentFeedback.tone === "success"
                ? "border-success/20 bg-success/8 text-success"
                : currentFeedback.tone === "warning"
                  ? "border-warning/20 bg-warning/8 text-warning"
                  : "border-ink/10 bg-white/55 text-ink-soft"
            }`}
          >
            <p className="font-semibold">{currentFeedback.message}</p>
            {currentQuestion.explanation ? <p className="mt-2 ui-reading-copy">{currentQuestion.explanation}</p> : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-4 border-t border-ink/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm leading-7 text-ink-soft">
            <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
            <span>
              {quiz.isDemo
                ? "O modo demo não persiste histórico."
                : "Ao finalizar, o resultado é salvo automaticamente no histórico."}
            </span>
          </div>
          <button className="ui-button-primary w-full sm:w-auto" disabled={submitMutation.isPending} onClick={handleAdvance} type="button">
            {submitMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MoveRight className="h-4 w-4" />}
            {currentIndex === quiz.questions.length - 1 ? "Finalizar quiz" : "Próxima questão"}
          </button>
        </div>
      </section>
    </div>
  );
}
