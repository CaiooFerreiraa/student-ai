"use client";

import { FileDown, LoaderCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import { useState } from "react";
import { toast } from "sonner";
import { getQuizDifficultyLabel } from "@/domain/value-objects/quiz-difficulty";

type ExportSessionButtonProps = {
  resultId: string;
};

type SessionReportResponse = {
  id: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  quiz: {
    title: string;
    difficulty: string;
    subject: {
      name: string;
    };
  };
  questionAttempts: Array<{
    sessionOrder: number;
    questionType: string;
    difficulty: string;
    topic: string | null;
    isCorrect: boolean | null;
    timeSpentMs: number;
    answerText: string | null;
    question: {
      prompt: string;
      explanation: string | null;
    };
  }>;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMilliseconds(value: number): string {
  const seconds = Math.round(value / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function ExportSessionButton({ resultId }: ExportSessionButtonProps) {
  const [isPending, setIsPending] = useState<boolean>(false);

  return (
    <button
      className="ui-button-secondary"
      disabled={isPending}
      onClick={async () => {
        try {
          setIsPending(true);
          toast.loading("Montando relatório em PDF...", { id: `export-${resultId}` });

          const response = await fetch(`/api/analytics/sessions/${resultId}`);
          const json = (await response.json()) as SessionReportResponse | { error: string };

          if (!response.ok || "error" in json) {
            throw new Error("error" in json ? json.error : "Falha ao exportar relatório.");
          }

          const doc = new jsPDF({
            unit: "pt",
            format: "a4",
          });

          let cursorY = 48;
          const pageWidth = doc.internal.pageSize.getWidth();
          const contentWidth = pageWidth - 96;

          const writeBlock = (text: string, size = 11, spacing = 18) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(size);
            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, 48, cursorY);
            cursorY += lines.length * spacing;
          };

          doc.setFont("helvetica", "bold");
          doc.setFontSize(24);
          doc.text("Student AI · Relatório de sessão", 48, cursorY);
          cursorY += 28;

          writeBlock(`${json.quiz.subject.name} · ${json.quiz.title}`, 12, 18);
          writeBlock(`Finalizado em ${formatDate(json.completedAt)}`, 11, 18);
          writeBlock(
            `Score ${json.score}% · ${json.correctAnswers}/${json.totalQuestions} corretas · nível ${getQuizDifficultyLabel(json.quiz.difficulty)}`,
            11,
            18,
          );
          writeBlock("", 11, 10);

          const averageTimeMs =
            json.questionAttempts.length > 0
              ? Math.round(
                  json.questionAttempts.reduce((total, attempt) => total + attempt.timeSpentMs, 0) /
                    json.questionAttempts.length,
                )
              : 0;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text("Resumo", 48, cursorY);
          cursorY += 20;

          writeBlock(`Tempo médio por questão: ${formatMilliseconds(averageTimeMs)}`);
          writeBlock(
            `Subtópicos cobertos: ${Array.from(
              new Set(json.questionAttempts.map((attempt) => attempt.topic).filter(Boolean)),
            ).join(", ") || "Sem subtópicos registrados"}`,
          );
          writeBlock("", 11, 10);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text("Questões", 48, cursorY);
          cursorY += 20;

          for (const attempt of json.questionAttempts) {
            if (cursorY > 730) {
              doc.addPage();
              cursorY = 48;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(
              `${attempt.sessionOrder + 1}. ${attempt.topic ?? "Sem subtópico"} · ${attempt.questionType.replace("_", " ")}`,
              48,
              cursorY,
            );
            cursorY += 18;

            writeBlock(attempt.question.prompt, 10, 16);
            writeBlock(
              `Resultado: ${
                attempt.isCorrect === null ? "Resposta aberta" : attempt.isCorrect ? "Correta" : "Incorreta"
              } · Tempo: ${formatMilliseconds(attempt.timeSpentMs)}`,
              10,
              16,
            );

            if (attempt.answerText) {
              writeBlock(`Resposta registrada: ${attempt.answerText}`, 10, 16);
            }

            if (attempt.question.explanation) {
              writeBlock(`Explicação: ${attempt.question.explanation}`, 10, 16);
            }

            cursorY += 8;
          }

          doc.save(`student-ai-session-${resultId}.pdf`);
          toast.success("Relatório exportado.", { id: `export-${resultId}` });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Falha ao exportar PDF.", {
            id: `export-${resultId}`,
          });
        } finally {
          setIsPending(false);
        }
      }}
      type="button"
    >
      {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      Exportar PDF
    </button>
  );
}
