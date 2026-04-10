import { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="ui-panel-cut ui-surface-noise relative overflow-hidden px-5 py-6 sm:px-7 sm:py-8">
      <div className="absolute -right-6 top-3 h-24 w-24 rounded-full border border-accent/20 bg-accent-soft/40 blur-2xl" />
      <div className="relative flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end xl:gap-6">
        <div className="min-w-0 max-w-[72rem]">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-ink-soft">{eyebrow}</p>
          <h1 className="mt-3 max-w-[62rem] text-balance font-[var(--font-display)] text-[2.25rem] font-extrabold uppercase leading-[0.88] tracking-[-0.08em] text-ink sm:text-[3rem] xl:text-[3.45rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-[54rem] text-[15px] leading-7 text-ink-soft sm:text-base sm:leading-8">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3 xl:justify-end xl:self-center">{actions}</div> : null}
      </div>
    </header>
  );
}
