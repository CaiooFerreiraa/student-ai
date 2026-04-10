import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookOpenText, LogIn } from "lucide-react";
import { auth } from "@/auth";
import { getQuizPlayback } from "@/application/use-cases/get-quiz-playback";
import { getQuizDifficultyLabel } from "@/domain/value-objects/quiz-difficulty";
import { AppChrome } from "@/presentation/components/app-chrome";
import { LogoutButton } from "@/presentation/components/logout-button";
import { PageHeader } from "@/presentation/components/page-header";
import { QuizPlayer } from "@/presentation/components/quiz-player";

type QuizPageProps = {
  params: Promise<{
    quizId: string;
  }>;
};

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId } = await params;
  const session = await auth();

  if (quizId !== "demo" && !session?.user?.id) {
    redirect("/login");
  }

  const quiz = await getQuizPlayback(quizId);

  if (!quiz) {
    notFound();
  }

  return (
    <AppChrome>
      <div className="space-y-5 pb-24 lg:pb-4">
        <PageHeader
          eyebrow={quiz.isDemo ? "Resolver quiz · Demo" : "Resolver quiz"}
          title={quiz.title}
          description={quiz.description ?? "Fluxo interativo com timer, progresso e feedback imediato por questão."}
          actions={
            <>
              <Link className="ui-button-secondary" href={quiz.isDemo ? "/" : "/dashboard"}>
                <ArrowLeft className="h-4 w-4" />
                {quiz.isDemo ? "Voltar" : "Dashboard"}
              </Link>
              {session?.user?.id ? (
                <LogoutButton />
              ) : (
                <Link className="ui-button-primary" href="/login">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
              )}
            </>
          }
        />

        <section className="ui-panel px-5 py-5 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="ui-badge">{quiz.subject.name}</span>
            <span className="ui-badge">{getQuizDifficultyLabel(quiz.difficulty)}</span>
            <span className="ui-badge">{quiz.totalQuestions} questões</span>
            {quiz.isDemo ? (
              <span className="ui-badge border-accent/25 bg-accent-soft/50 text-accent">navegação pública</span>
            ) : null}
          </div>
          <QuizPlayer quiz={quiz} />
        </section>

        {quiz.isDemo ? (
          <section className="ui-panel-cut ui-surface-noise px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <BookOpenText className="h-5 w-5 text-accent" />
              <div>
                <p className="ui-label mb-0">Modo demonstração</p>
                <h2 className="mt-2 font-[var(--font-display)] text-[2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
                  Sem persistência
                </h2>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-soft">
              O demo existe para validar interface, feedback por questão e responsividade sem depender de dados reais.
            </p>
          </section>
        ) : null}
      </div>
    </AppChrome>
  );
}
