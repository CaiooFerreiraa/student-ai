import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="app-shell">
      <section className="ui-panel-cut ui-surface-noise mx-auto max-w-3xl px-5 py-8 text-center sm:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-white/70">
          <SearchX className="h-5 w-5 text-accent" />
        </div>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.26em] text-ink-soft">Não encontrado</p>
        <h1 className="mt-3 font-[var(--font-display)] text-[3rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
          Esta rota não existe no MVP atual.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-soft">
          O escopo visual desta fase está fechado nas 5 telas principais. Volte ao dashboard para seguir pelo fluxo previsto.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="ui-button-primary" href="/dashboard">
            Abrir dashboard
          </Link>
          <Link className="ui-button-secondary" href="/">
            Ir para início
          </Link>
        </div>
      </section>
    </main>
  );
}
