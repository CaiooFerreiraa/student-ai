import Link from "next/link";
import { ArrowRight, BookOpenText, FolderInput, ShieldCheck, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { getDashboardOverview } from "@/application/use-cases/get-dashboard-overview";
import { getQuizDifficultyLabel } from "@/domain/value-objects/quiz-difficulty";

function formatMetric(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export default async function HomePage() {
  const session = await auth();
  const overview = session?.user?.id ? await getDashboardOverview(session.user.id) : null;
  const latestQuizzes = overview?.quizzes.slice(0, 3) ?? [];

  return (
    <main className="app-shell">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_360px]">
        <div className="ui-panel-cut ui-surface-noise relative overflow-hidden px-5 py-8 sm:px-7 sm:py-9">
          <div className="absolute inset-y-0 right-0 hidden w-32 bg-[linear-gradient(180deg,rgba(164,73,28,0.12),transparent)] lg:block" />
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-ink-soft">
              Frontend MVP · Semanas 8-10
            </p>
            <h1 className="mt-4 font-[var(--font-display)] text-[3.4rem] font-extrabold uppercase leading-[0.86] tracking-[-0.1em] text-ink sm:text-[4.8rem]">
              Study engine com fluxo claro para gerar, resolver e revisar quizzes.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft sm:text-[15px]">
              Interface mobile-first, clara no modo claro e preparada para PDF, geração assistida por LLM e revisão
              orientada por resultado.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="ui-button-primary" href={session ? "/dashboard" : "/register"}>
              <ArrowRight className="h-4 w-4" />
              {session ? "Abrir dashboard" : "Criar acesso"}
            </Link>
            <Link className="ui-button-secondary" href={session ? "/quizzes/new" : "/login"}>
              {session ? "Gerar quiz" : "Entrar"}
            </Link>
            <Link className="ui-button-ghost rounded-full border border-ink/10 bg-white/70 px-5" href="/quizzes/demo">
              Ver demo
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="ui-card p-5">
              <p className="ui-label">Direção visual</p>
              <p className="font-[var(--font-display)] text-[2rem] font-extrabold uppercase leading-none tracking-[-0.08em] text-ink">
                Minimalista refinado
              </p>
              <p className="mt-4 text-sm leading-7 text-ink-soft">
                Tipografia de impacto, contraste quente e blocos cortados para evitar aparência de template genérico.
              </p>
            </article>
            <article className="ui-card p-5">
              <p className="ui-label">Escopo fechado</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm text-ink">
                  <span>Dashboard</span>
                  <span className="ui-badge">core</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-ink">
                  <span>Criar quiz</span>
                  <span className="ui-badge">core</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-ink">
                  <span>Resolver quiz</span>
                  <span className="ui-badge">core</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-ink">
                  <span>Histórico</span>
                  <span className="ui-badge">core</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-ink">
                  <span>Upload contexto</span>
                  <span className="ui-badge">core</span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <aside className="ui-panel relative px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="ui-label mb-0">Snapshot</p>
              <h2 className="mt-2 font-[var(--font-display)] text-3xl font-extrabold uppercase tracking-[-0.08em] text-ink">
                Sistema
              </h2>
            </div>
            <ShieldCheck className="h-5 w-5 text-accent" />
          </div>

          {overview ? (
            <div className="mt-6 space-y-3">
              <article className="ui-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Matérias</p>
                <p className="mt-2 font-[var(--font-display)] text-[2rem] font-extrabold tracking-[-0.08em] text-ink">
                  {formatMetric(overview.metrics.subjects)}
                </p>
              </article>
              <article className="ui-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Quizzes</p>
                <p className="mt-2 font-[var(--font-display)] text-[2rem] font-extrabold tracking-[-0.08em] text-ink">
                  {formatMetric(overview.metrics.quizzes)}
                </p>
              </article>
              <article className="ui-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Resultados</p>
                <p className="mt-2 font-[var(--font-display)] text-[2rem] font-extrabold tracking-[-0.08em] text-ink">
                  {formatMetric(overview.metrics.results)}
                </p>
              </article>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 bg-white/45 p-5 text-sm leading-7 text-ink-soft">
              Entre com sua conta para acompanhar o catálogo, os resultados e o histórico gerado pelo estudo.
            </div>
          )}
        </aside>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.94fr_1.06fr]">
        <article className="ui-panel px-5 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <FolderInput className="h-5 w-5 text-accent" />
            <div>
              <p className="ui-label mb-0">Fluxo de contexto</p>
              <h2 className="mt-2 font-[var(--font-display)] text-[2.2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                PDF para quiz
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <div className="ui-card p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">1. Upload e preview</p>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                O usuário envia o PDF, valida a extração e inspeciona os primeiros chunks antes de consumir API.
              </p>
            </div>
            <div className="ui-card p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">2. Geração com streaming</p>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                O pipeline responde em SSE para expor progresso e reduzir percepção de latência.
              </p>
            </div>
            <div className="ui-card p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">3. Resolução e histórico</p>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                O quiz vira fluxo interativo com timer, feedback imediato e persistência no histórico.
              </p>
            </div>
          </div>
        </article>

        <article className="ui-panel-cut ui-surface-noise px-5 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent" />
            <div>
              <p className="ui-label mb-0">Catálogo</p>
              <h2 className="mt-2 font-[var(--font-display)] text-[2.2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                Últimos quizzes
              </h2>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {latestQuizzes.length ? (
              latestQuizzes.map((quiz) => (
                <article className="ui-card p-4" key={quiz.id}>
                  <div className="flex flex-wrap gap-2">
                    <span className="ui-badge">{quiz.subject.name}</span>
                    <span className="ui-badge">{getQuizDifficultyLabel(quiz.difficulty)}</span>
                  </div>
                  <p className="mt-4 font-[var(--font-display)] text-[1.8rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                    {quiz.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-ink-soft">
                    {quiz.description ?? "Quiz pronto para revisão guiada por contexto."}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white/45 p-5 text-sm leading-7 text-ink-soft">
                O catálogo aparece aqui quando existir pelo menos um quiz persistido no banco.
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="ui-button-primary" href={session ? "/dashboard" : "/register"}>
              <BookOpenText className="h-4 w-4" />
              {session ? "Abrir catálogo" : "Começar"}
            </Link>
            {!session ? (
              <Link className="ui-button-secondary" href="/login">
                Entrar
              </Link>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}
