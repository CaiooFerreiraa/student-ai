import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookMarked,
  FolderOpenDot,
  GraduationCap,
  History,
  Orbit,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import { auth } from "@/auth";
import { getAnalyticsOverview } from "@/application/use-cases/get-analytics-overview";
import { getDashboardOverview } from "@/application/use-cases/get-dashboard-overview";
import { analyticsFiltersSchema, analyticsQuerySchema } from "@/application/validators/analytics-schemas";
import { getQuizDifficultyLabel } from "@/domain/value-objects/quiz-difficulty";
import { AppChrome } from "@/presentation/components/app-chrome";
import { EmptyState } from "@/presentation/components/empty-state";
import { LogoutButton } from "@/presentation/components/logout-button";
import { MetricCard } from "@/presentation/components/metric-card";
import { PageHeader } from "@/presentation/components/page-header";
import { PerformanceDashboard } from "@/presentation/components/performance-dashboard";
import { QuizCatalog } from "@/presentation/components/quiz-catalog";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildDashboardPeriodHref(period: string): string {
  const params = new URLSearchParams();
  params.set("period", period);
  return `/dashboard?${params.toString()}`;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const rawSearchParams = (await searchParams) ?? {};
  const analyticsFilters = analyticsFiltersSchema.parse(analyticsQuerySchema.parse(rawSearchParams));
  const [overview, analytics] = await Promise.all([
    getDashboardOverview(session.user.id),
    getAnalyticsOverview(session.user.id, analyticsFilters),
  ]);
  const catalogItems = overview.quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    difficulty: quiz.difficulty,
    totalQuestions: quiz.questions.length,
    updatedAt: quiz.updatedAt.toISOString(),
    subject: {
      id: quiz.subject.id,
      name: quiz.subject.name,
      slug: quiz.subject.slug,
    },
    resultCount: quiz._count.results,
  }));
  const recentResults = overview.history.slice(0, 3);

  return (
    <AppChrome>
      <div className="space-y-5 pb-24 lg:pb-4">
        <PageHeader
          eyebrow="Dashboard"
          title="Operação diária do estudo assistido."
          description="Monitore matéria, geração e revisão sem sair do fluxo principal. O MVP fecha catálogo, criação, resolução e histórico em uma única navegação."
          actions={
            <>
              <Link className="ui-button-primary" href="/quizzes/new">
                <Sparkles className="h-4 w-4" />
                Criar quiz
              </Link>
              <LogoutButton />
            </>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <MetricCard
            description="Matérias prontas para segmentar contexto e catálogo."
            icon={GraduationCap}
            label="Matérias"
            value={String(overview.metrics.subjects)}
          />
          <MetricCard
            description="Quizzes publicados ou gerados a partir do pipeline LLM."
            icon={BookMarked}
            label="Quizzes"
            value={String(overview.metrics.quizzes)}
          />
          <MetricCard
            description="Taxa de acerto consolidada no período filtrado."
            icon={Target}
            label="Acerto"
            value={`${analytics.summary.accuracyRate}%`}
          />
          <MetricCard
            description="Tempo médio por questão para diagnosticar atrito real."
            icon={TimerReset}
            label="Tempo médio"
            value={`${Math.round(analytics.summary.averageTimeMs / 1000)}s`}
          />
        </section>

        <section className="space-y-5">
          <div className="ui-panel flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6">
            <div>
              <p className="ui-label mb-0">Analytics</p>
              <h2 className="mt-2 font-[var(--font-display)] text-[2.2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                Desempenho por período
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {["7d", "30d", "90d", "365d", "all"].map((period) => (
                <Link
                  className={analyticsFilters.period === period ? "ui-button-primary" : "ui-button-secondary"}
                  href={buildDashboardPeriodHref(period)}
                  key={period}
                >
                  {period}
                </Link>
              ))}
            </div>
          </div>

          <PerformanceDashboard
            difficultyBreakdown={analytics.difficultyBreakdown}
            questionTypeBreakdown={analytics.questionTypeBreakdown}
            subjectBreakdown={analytics.subjectBreakdown}
            timeline={analytics.timeline}
          />

          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="ui-panel min-w-0 px-5 py-5 sm:px-6 lg:px-7">
              <p className="ui-label mb-0">Subtópicos frágeis</p>
              <h3 className="mt-2 font-[var(--font-display)] text-[2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                Pontos de atenção
              </h3>
              <div className="mt-6 space-y-3">
                {analytics.weakTopics.length ? (
                  analytics.weakTopics.map((topic) => (
                    <article className="ui-card p-4" key={topic.key}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">{topic.label}</span>
                        <span className="ui-badge">{topic.attempts} respostas</span>
                      </div>
                      <div className="mt-3 overflow-hidden rounded-full bg-ink/8">
                        <div className="h-2 rounded-full bg-warning" style={{ width: `${topic.accuracy}%` }} />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-ink-soft">
                        <span>{topic.accuracy}% de acerto</span>
                        <span>{Math.round(topic.averageTimeMs / 1000)}s médio</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyState
                    description="Ainda não há volume suficiente para detectar subtópicos frágeis com segurança."
                    icon={Orbit}
                    title="Sem sinal analítico"
                  />
                )}
              </div>
            </section>

            <aside className="ui-panel-cut ui-surface-noise px-5 py-5 sm:px-6 lg:px-7">
              <p className="ui-label mb-0">Recomendação</p>
              <h3 className="mt-2 font-[var(--font-display)] text-[2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                Próximo quiz
              </h3>
              {analytics.recommendation ? (
                <div className="mt-6 space-y-4">
                  <div className="ui-card p-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="ui-badge">{analytics.recommendation.subject.name}</span>
                      <span className="ui-badge">{getQuizDifficultyLabel(analytics.recommendation.difficulty)}</span>
                    </div>
                    <p className="mt-4 font-[var(--font-display)] text-[1.8rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                      {analytics.recommendation.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-ink-soft">{analytics.recommendation.reason}</p>
                  </div>
                  <Link className="ui-button-primary" href={`/quizzes/${analytics.recommendation.id}`}>
                    Abrir recomendação
                  </Link>
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 bg-white/45 p-5 text-sm leading-7 text-ink-soft">
                  Gere mais quizzes ou conclua mais sessões para liberar recomendação automática baseada em pontos fracos.
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <QuizCatalog items={catalogItems} />
          </div>

          <aside className="space-y-5">
            <section className="ui-panel-cut ui-surface-noise px-5 py-5 sm:px-6 lg:px-7">
              <p className="ui-label mb-0">Conta</p>
              <h2 className="mt-2 font-[var(--font-display)] text-[2.2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                {session.user.name ?? "Aluno ativo"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">{session.user.email}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="ui-button-secondary" href="/context">
                  <FolderOpenDot className="h-4 w-4" />
                  Upload contexto
                </Link>
                <Link className="ui-button-secondary" href="/history">
                  <History className="h-4 w-4" />
                  Ver histórico
                </Link>
              </div>
            </section>

            <section className="ui-panel px-5 py-5 sm:px-6 lg:px-7">
              <p className="ui-label mb-0">Resultados recentes</p>
              <h2 className="mt-2 font-[var(--font-display)] text-[2.2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                Ritmo atual
              </h2>
              <div className="mt-6 space-y-3">
                {recentResults.length ? (
                  recentResults.map((result) => (
                    <article className="ui-card p-4" key={result.id}>
                      <div className="flex flex-wrap gap-2">
                        <span className="ui-badge">{result.quiz.subject.name}</span>
                        <span className="ui-badge">{getQuizDifficultyLabel(result.quiz.difficulty)}</span>
                      </div>
                      <p className="mt-4 font-[var(--font-display)] text-[1.7rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                        {result.score}%
                      </p>
                      <p className="mt-2 text-sm leading-7 text-ink-soft">
                        {result.correctAnswers}/{result.totalQuestions} corretas em {result.quiz.title}.
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyState
                    actionHref="/quizzes/demo"
                    actionLabel="Abrir demo"
                    description="Ainda não existem resultados persistidos. Use o demo para validar o fluxo de resolução ou gere o primeiro quiz."
                    icon={History}
                    title="Histórico vazio"
                  />
                )}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </AppChrome>
  );
}
