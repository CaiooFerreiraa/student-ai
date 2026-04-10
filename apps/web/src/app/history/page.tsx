import Link from "next/link";
import { redirect } from "next/navigation";
import { FileClock, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { getPaginatedHistory } from "@/application/use-cases/get-paginated-history";
import { listSubjects } from "@/application/use-cases/list-subjects";
import { analyticsFiltersSchema, paginatedHistoryQuerySchema } from "@/application/validators/analytics-schemas";
import { AppChrome } from "@/presentation/components/app-chrome";
import { EmptyState } from "@/presentation/components/empty-state";
import { HistoryFiltersForm } from "@/presentation/components/history-filters-form";
import { HistoryList } from "@/presentation/components/history-list";
import { HistoryPagination } from "@/presentation/components/history-pagination";
import { PageHeader } from "@/presentation/components/page-header";

type HistoryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildHistoryHref(
  page: number,
  filters: {
    period?: string;
    subjectId?: string;
    difficulty?: string;
    questionType?: string;
    from?: string;
    to?: string;
  },
): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", "10");

  if (filters.period) {
    params.set("period", filters.period);
  }

  if (filters.subjectId) {
    params.set("subjectId", filters.subjectId);
  }

  if (filters.difficulty) {
    params.set("difficulty", filters.difficulty);
  }

  if (filters.questionType) {
    params.set("questionType", filters.questionType);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  return `/history?${params.toString()}`;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const rawSearchParams = (await searchParams) ?? {};
  const historyQuery = paginatedHistoryQuerySchema.parse(rawSearchParams);
  const filters = analyticsFiltersSchema.parse(historyQuery);
  const [history, subjects] = await Promise.all([
    getPaginatedHistory(session.user.id, {
      ...filters,
      page: historyQuery.page,
      pageSize: historyQuery.pageSize,
    }),
    listSubjects(),
  ]);

  return (
    <AppChrome>
      <div className="space-y-5 pb-24 lg:pb-4">
        <PageHeader
          eyebrow="Histórico"
          title="Resultados para revisão contínua."
          description="Acompanhe desempenho, recupere quizzes resolvidos e identifique matéria, dificuldade e tipo de questão que exigem reforço."
          actions={
            <Link className="ui-button-primary" href="/quizzes/new">
              <Sparkles className="h-4 w-4" />
              Novo quiz
            </Link>
          }
        />

        <HistoryFiltersForm
          subjects={subjects.map((subject) => ({
            id: subject.id,
            name: subject.name,
          }))}
          values={{
            period: filters.period,
            subjectId: filters.subjectId,
            difficulty: filters.difficulty,
            questionType: filters.questionType,
            from: filters.from,
            to: filters.to,
          }}
        />

        {history.items.length ? (
          <>
            <HistoryList
              items={history.items.map((item) => ({
                id: item.id,
                score: item.score,
                correctAnswers: item.correctAnswers,
                totalQuestions: item.totalQuestions,
                completedAt: item.completedAt.toISOString(),
                averageTimeMs: item.questionAttempts.length
                  ? Math.round(
                      item.questionAttempts.reduce((total, attempt) => total + attempt.timeSpentMs, 0) /
                        item.questionAttempts.length,
                    )
                  : 0,
                questionTypes: Array.from(new Set(item.questionAttempts.map((attempt) => attempt.questionType))),
                weakTopics: item.questionAttempts
                  .filter((attempt) => attempt.isCorrect === false && attempt.topic)
                  .slice(0, 3)
                  .map((attempt) => attempt.topic as string),
                quiz: {
                  id: item.quiz.id,
                  title: item.quiz.title,
                  difficulty: item.quiz.difficulty,
                  subject: {
                    name: item.quiz.subject.name,
                  },
                },
              }))}
            />
            <HistoryPagination
              buildHref={(page) =>
                buildHistoryHref(page, {
                  period: filters.period,
                  subjectId: filters.subjectId,
                  difficulty: filters.difficulty,
                  questionType: filters.questionType,
                  from: filters.from,
                  to: filters.to,
                })
              }
              page={history.page}
              totalPages={history.totalPages}
            />
          </>
        ) : (
          <EmptyState
            actionHref="/quizzes/demo"
            actionLabel="Abrir demo"
            description="Seu histórico ainda está vazio para os filtros aplicados. Resolva um quiz gerado, ajuste os filtros ou use o demo para validar a experiência."
            icon={FileClock}
            title="Nenhum resultado salvo"
          />
        )}
      </div>
    </AppChrome>
  );
}
