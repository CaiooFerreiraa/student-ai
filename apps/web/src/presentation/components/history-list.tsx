import { CalendarClock, ChartColumnIncreasing, FileText } from "lucide-react";
import { getQuizDifficultyLabel } from "@/domain/value-objects/quiz-difficulty";
import { ExportSessionButton } from "@/presentation/components/export-session-button";

type HistoryItem = {
  id: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  averageTimeMs: number;
  questionTypes: string[];
  weakTopics: string[];
  quiz: {
    id: string;
    title: string;
    difficulty: string;
    subject: {
      name: string;
    };
  };
};

type HistoryListProps = {
  items: HistoryItem[];
};

function formatMilliseconds(value: number): string {
  const seconds = Math.round(value / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function HistoryList({ items }: HistoryListProps) {
  return (
    <div className="space-y-4">
      {items.map((item: HistoryItem) => (
        <article className="ui-panel-cut px-5 py-5 sm:px-6 lg:px-7 lg:py-6" key={item.id}>
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className="ui-badge">{item.quiz.subject.name}</span>
                <span className="ui-badge">{getQuizDifficultyLabel(item.quiz.difficulty)}</span>
              </div>
              <h3 className="mt-4 max-w-4xl text-balance font-[var(--font-display)] text-[1.6rem] font-extrabold uppercase leading-[0.92] tracking-[-0.08em] text-ink sm:text-[1.9rem] xl:text-[2.15rem]">
                {item.quiz.title}
              </h3>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-7 text-ink-soft">
                <span className="inline-flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  {formatDate(item.completedAt)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {item.correctAnswers}/{item.totalQuestions} corretas
                </span>
                <span>Tempo médio {formatMilliseconds(item.averageTimeMs)}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.questionTypes.map((questionType) => (
                  <span className="ui-badge" key={questionType}>
                    {questionType.replace("_", " ")}
                  </span>
                ))}
                {item.weakTopics.map((topic) => (
                  <span className="ui-badge" key={topic}>
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,190px)_auto] xl:grid-cols-1">
              <div className="ui-card min-w-[180px] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Aproveitamento</p>
                <div className="mt-3 flex items-center gap-3">
                  <ChartColumnIncreasing className="h-5 w-5 text-accent" />
                  <p className="font-[var(--font-display)] text-[2.2rem] font-extrabold leading-none tracking-[-0.09em] text-ink">
                    {item.score}%
                  </p>
                </div>
              </div>
              <ExportSessionButton resultId={item.id} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
