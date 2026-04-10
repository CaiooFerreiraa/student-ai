import Link from "next/link";
import { ArrowLeft, BookOpenText, ShieldCheck, UserRoundPlus } from "lucide-react";
import { RegisterForm } from "@/presentation/components/register-form";

export default function RegisterPage() {
  return (
    <main className="app-shell">
      <div className="grid min-h-[calc(100vh-2rem)] gap-5 lg:grid-cols-[0.98fr_1.02fr]">
        <section className="ui-panel flex items-center px-5 py-6 sm:px-7 sm:py-8 lg:order-2">
          <div className="mx-auto w-full max-w-xl">
            <p className="ui-label mb-0">Cadastro</p>
            <h1 className="mt-2 font-[var(--font-display)] text-[2.7rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
              Crie o acesso inicial
            </h1>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              A conta entra no fluxo de estudo com persistência para quizzes, documentos e resultados.
            </p>
            <div className="mt-8">
              <RegisterForm />
            </div>
            <p className="mt-6 text-sm leading-7 text-ink-soft">
              Já possui conta?{" "}
              <Link className="font-semibold text-ink underline decoration-accent/40 underline-offset-4" href="/login">
                Entrar agora
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="ui-panel-cut ui-surface-noise flex flex-col justify-between px-5 py-6 sm:px-7 sm:py-8 lg:order-1">
          <div>
            <Link className="ui-button-ghost rounded-full border border-ink/10 bg-white/70 px-4" href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.26em] text-ink-soft">Onboarding direto</p>
            <h2 className="mt-4 font-[var(--font-display)] text-[3.2rem] font-extrabold uppercase leading-[0.86] tracking-[-0.1em] text-ink sm:text-[4.4rem]">
              Menos fricção para começar a estudar com contexto real.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-ink-soft">
              O MVP evita telas extras: cadastro, criação de quiz, resolução e histórico ficam disponíveis logo após o acesso.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <article className="ui-card p-4">
              <UserRoundPlus className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink">Conta</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Criação simples para entrar no fluxo sem ruído.</p>
            </article>
            <article className="ui-card p-4">
              <BookOpenText className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink">Quiz</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Pronto para catálogo, resolução e resultados.</p>
            </article>
            <article className="ui-card p-4">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink">Segurança</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Validação, CSP, rate limit e sessão protegida.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
