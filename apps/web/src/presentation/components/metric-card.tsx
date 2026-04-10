import { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, description, icon: Icon }: MetricCardProps) {
  return (
    <article className="ui-card relative min-w-0 overflow-hidden border-ink/10 bg-white/65 p-5 lg:p-6">
      <div className="mb-8 flex items-center justify-between">
        <span className="ui-badge">{label}</span>
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <p className="font-[var(--font-display)] text-[2.8rem] font-extrabold leading-none tracking-[-0.09em] text-ink">
        {value}
      </p>
      <p className="mt-3 max-w-[22rem] text-sm leading-7 text-ink-soft">{description}</p>
    </article>
  );
}
