"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BreakdownItem = {
  key: string;
  label: string;
  attempts: number;
  accuracy: number;
  averageTimeMs: number;
};

type TimelinePoint = {
  label: string;
  averageScore: number;
  accuracy: number;
  sessions: number;
};

type PerformanceDashboardProps = {
  subjectBreakdown: BreakdownItem[];
  difficultyBreakdown: BreakdownItem[];
  questionTypeBreakdown: BreakdownItem[];
  timeline: TimelinePoint[];
};

type ChartFrameProps = {
  className: string;
  children: () => React.ReactNode;
};

function ChartFrame({ className, children }: ChartFrameProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const node = frameRef.current;

    if (!node) {
      return;
    }

    const updateReadyState = (): void => {
      const nextWidth = node.clientWidth;
      const nextHeight = node.clientHeight;
      setIsReady(nextWidth > 0 && nextHeight > 0);
    };

    updateReadyState();

    const resizeObserver = new ResizeObserver(() => {
      updateReadyState();
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={`${className} min-w-0`} ref={frameRef}>
      {isReady ? children() : <div className="ui-skeleton h-full w-full" />}
    </div>
  );
}

function formatMilliseconds(value: number): string {
  const seconds = Math.round(value / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function tooltipValueFormatter(
  value: number | string | ReadonlyArray<number | string> | undefined,
  key: string | number | undefined,
): string {
  if (typeof value !== "number") {
    return String(value ?? "");
  }

  return key === "averageTimeMs" ? formatMilliseconds(value) : `${value}%`;
}

export function PerformanceDashboard({
  subjectBreakdown,
  difficultyBreakdown,
  questionTypeBreakdown,
  timeline,
}: PerformanceDashboardProps) {
  const subjectChartData = subjectBreakdown.slice(0, 6);
  const difficultyChartData = difficultyBreakdown;
  const questionTypeChartData = questionTypeBreakdown.map((item) => ({
    ...item,
    label: item.label.replace("_", " "),
  }));

  return (
    <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1.14fr)_minmax(320px,0.86fr)]">
      <section className="ui-panel min-w-0 px-5 py-5 sm:px-6 lg:px-7">
        <p className="ui-label mb-0">Linha do tempo</p>
        <h3 className="mt-2 font-[var(--font-display)] text-[2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
          Evolução por período
        </h3>
        <ChartFrame className="mt-6 h-[280px] lg:h-[320px]">
          {() => (
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#a4491c" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#a4491c" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(22,20,17,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#655f57" tickLine={false} axisLine={false} />
                <YAxis stroke="#655f57" tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "18px",
                    border: "1px solid rgba(22,20,17,0.12)",
                    backgroundColor: "rgba(251,247,240,0.96)",
                    color: "#161411",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#a4491c"
                  strokeWidth={2}
                  fill="url(#scoreFill)"
                  name="Score médio"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartFrame>
      </section>

      <section className="grid min-w-0 gap-5">
        <article className="ui-panel-cut ui-surface-noise min-w-0 px-5 py-5 sm:px-6 lg:px-7">
          <p className="ui-label mb-0">Matérias</p>
          <h3 className="mt-2 font-[var(--font-display)] text-[2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
            Taxa de acerto
          </h3>
          <ChartFrame className="mt-6 h-[280px]">
            {() => (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={subjectChartData} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid stroke="rgba(22,20,17,0.08)" horizontal={false} />
                  <XAxis type="number" stroke="#655f57" tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={92}
                    stroke="#655f57"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={tooltipValueFormatter}
                    contentStyle={{
                      borderRadius: "18px",
                      border: "1px solid rgba(22,20,17,0.12)",
                      backgroundColor: "rgba(251,247,240,0.96)",
                    }}
                  />
                  <Bar dataKey="accuracy" fill="#a4491c" radius={[12, 12, 12, 12]} name="Acerto" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartFrame>
        </article>
      </section>

      <section className="ui-panel-cut min-w-0 px-5 py-5 sm:px-6 lg:px-7">
        <p className="ui-label mb-0">Dificuldade</p>
        <h3 className="mt-2 font-[var(--font-display)] text-[2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
          Leitura por nível
        </h3>
        <ChartFrame className="mt-6 h-[280px]">
          {() => (
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={difficultyChartData}>
                <CartesianGrid stroke="rgba(22,20,17,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#655f57" tickLine={false} axisLine={false} />
                <YAxis stroke="#655f57" tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "18px",
                    border: "1px solid rgba(22,20,17,0.12)",
                    backgroundColor: "rgba(251,247,240,0.96)",
                  }}
                />
                <Bar dataKey="accuracy" fill="#7b2f0f" radius={[12, 12, 0, 0]} name="Acerto" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartFrame>
      </section>

      <section className="ui-panel min-w-0 px-5 py-5 sm:px-6 lg:px-7">
        <p className="ui-label mb-0">Tipo de questão</p>
        <h3 className="mt-2 font-[var(--font-display)] text-[2rem] font-extrabold uppercase tracking-[-0.08em] text-ink">
          Ritmo de resposta
        </h3>
        <div className="mt-6 grid gap-3">
          {questionTypeChartData.map((item) => (
            <article className="ui-card p-4" key={item.key}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">{item.label}</span>
                <span className="ui-badge">{formatMilliseconds(item.averageTimeMs)}</span>
              </div>
              <div className="mt-3 overflow-hidden rounded-full bg-ink/8">
                <div className="h-2 rounded-full bg-accent" style={{ width: `${item.accuracy}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-ink-soft">
                <span>{item.accuracy}% de acerto</span>
                <span>{item.attempts} respostas</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
