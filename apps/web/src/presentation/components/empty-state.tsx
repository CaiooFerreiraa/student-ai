import Link from "next/link";
import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="ui-panel border-dashed px-5 py-10 text-center sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-white/70">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <h3 className="mt-5 font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.08em] text-ink">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-soft">{description}</p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Link className="ui-button-primary" href={actionHref}>
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
