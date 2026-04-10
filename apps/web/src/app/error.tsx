"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app-shell">
      <section className="ui-panel-cut ui-surface-noise mx-auto max-w-3xl px-5 py-8 text-center sm:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-white/70">
          <AlertTriangle className="h-5 w-5 text-danger" />
        </div>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.26em] text-ink-soft">Erro de interface</p>
        <h1 className="mt-3 font-[var(--font-display)] text-[3rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
          O fluxo falhou antes de concluir.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-soft">
          Recarregue esta visão ou volte ao painel. O objetivo aqui é não deixar o usuário preso em uma tela sem saída.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="ui-button-primary" onClick={reset} type="button">
            <RefreshCcw className="h-4 w-4" />
            Tentar novamente
          </button>
          <Link className="ui-button-secondary" href="/dashboard">
            Ir ao dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
