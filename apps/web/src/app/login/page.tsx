import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { getServerEnv } from "@/infrastructure/config/env";
import { LoginForm } from "@/presentation/components/login-form";

export default function LoginPage() {
  const env = getServerEnv();
  const oauthProviders = {
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
  };

  return (
    <main className="app-shell">
      <div className="grid min-h-[calc(100vh-2rem)] gap-5 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="ui-panel-cut ui-surface-noise flex flex-col justify-between px-5 py-6 sm:px-7 sm:py-8">
          <div>
            <Link className="ui-button-ghost rounded-full border border-ink/10 bg-white/70 px-4" href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.26em] text-ink-soft">Acesso seguro</p>
            <h1 className="mt-4 font-[var(--font-display)] text-[3.2rem] font-extrabold uppercase leading-[0.86] tracking-[-0.1em] text-ink sm:text-[4.4rem]">
              Entre para continuar o ciclo de estudo.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-ink-soft">
              Credenciais e OAuth opcional ficam disponíveis sem ruído visual, com validação em frontend e backend.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <article className="ui-card p-4">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink">JWT</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Sessão estável para preview e produção.</p>
            </article>
            <article className="ui-card p-4">
              <KeyRound className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink">Credenciais</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Fluxo direto para MVP sem dependência externa.</p>
            </article>
            <article className="ui-card p-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink">OAuth</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Ativado só quando as chaves estiverem presentes.</p>
            </article>
          </div>
        </section>

        <section className="ui-panel flex items-center px-5 py-6 sm:px-7 sm:py-8">
          <div className="mx-auto w-full max-w-xl">
            <p className="ui-label mb-0">Login</p>
            <h2 className="mt-2 font-[var(--font-display)] text-[2.7rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
              Acesse sua conta
            </h2>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              O painel centraliza criação de quiz, upload de contexto e histórico de resultados.
            </p>
            <div className="mt-8">
              <LoginForm oauthProviders={oauthProviders} />
            </div>
            <p className="mt-6 text-sm leading-7 text-ink-soft">
              Ainda sem conta?{" "}
              <Link className="font-semibold text-ink underline decoration-accent/40 underline-offset-4" href="/register">
                Crie seu acesso
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
