import { AppChrome } from "@/presentation/components/app-chrome";
import { SkeletonGrid } from "@/presentation/components/skeleton-grid";

type RouteLoadingShellProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function RouteLoadingShell({ eyebrow, title, description }: RouteLoadingShellProps) {
  return (
    <AppChrome>
      <div className="space-y-5 pb-24 lg:pb-4">
        <section className="ui-panel-cut ui-surface-noise px-5 py-6 sm:px-7 sm:py-8">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-ink-soft">{eyebrow}</p>
            <h1 className="mt-3 font-[var(--font-display)] text-[2.8rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
              {title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-ink-soft">{description}</p>
          </div>
        </section>

        <section className="ui-panel px-5 py-5 sm:px-6">
          <SkeletonGrid items={6} />
        </section>
      </div>
    </AppChrome>
  );
}
