"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  Clock3,
  FolderInput,
  LayoutDashboard,
  PlusSquare,
} from "lucide-react";

type AppChromeProps = {
  children: React.ReactNode;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quizzes/new", label: "Criar Quiz", icon: PlusSquare },
  { href: "/context", label: "Upload Contexto", icon: FolderInput },
  { href: "/history", label: "Histórico", icon: Clock3 },
  { href: "/quizzes/demo", label: "Resolver Quiz", icon: BookOpenText },
];

export function AppChrome({ children }: AppChromeProps) {
  const pathname: string = usePathname();

  return (
    <div className="app-shell">
      <div className="ui-grid-aside">
        <aside className="ui-panel-cut ui-surface-noise sticky top-4 hidden h-[calc(100vh-2rem)] overflow-hidden 2xl:flex 2xl:flex-col">
          <div className="border-b border-ink/10 px-5 py-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink-soft">
              Student AI
            </p>
            <h1 className="mt-3 font-[var(--font-display)] text-[2.1rem] font-extrabold uppercase leading-[0.9] tracking-[-0.08em] text-ink">
              Study Engine
            </h1>
            <p className="mt-3 max-w-[13rem] text-sm leading-7 text-ink-soft">
              MVP visual controlado para criar, resolver e revisar quizzes a partir de contexto real.
            </p>
          </div>

          <nav className="flex-1 px-4 py-5">
            <ul className="space-y-2">
              {navigationItems.map((item: NavigationItem) => {
                const isActive: boolean = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      className={`flex min-h-12 items-center gap-3 rounded-[1.15rem] px-4 py-3 text-sm font-semibold transition duration-200 ${
                        isActive
                          ? "bg-ink text-paper-strong"
                          : "text-ink-soft hover:-translate-y-0.5 hover:bg-white/70 hover:text-ink"
                      }`}
                      href={item.href}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="ui-panel mb-5 flex items-center justify-between gap-4 px-4 py-4 sm:px-6 2xl:hidden">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink-soft">Student AI</p>
              <h2 className="font-[var(--font-display)] text-[1.85rem] font-extrabold tracking-[-0.08em]">
                Study Engine
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {navigationItems.slice(0, 3).map((item: NavigationItem) => {
                const Icon = item.icon;

                return (
                  <Link
                    className="ui-button-ghost rounded-full border border-ink/10 bg-white/70 px-3"
                    href={item.href}
                    key={item.href}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </header>

          <div>{children}</div>
        </div>
      </div>

      <nav className="ui-panel fixed inset-x-4 bottom-4 z-40 flex items-center justify-around px-3 py-2 2xl:hidden">
        {navigationItems.map((item: NavigationItem) => {
          const Icon = item.icon;
          const isActive: boolean = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={`flex min-h-11 min-w-11 flex-col items-center justify-center rounded-2xl px-2 text-[10px] font-bold uppercase tracking-[0.18em] ${
                isActive ? "bg-ink text-paper-strong" : "text-ink-soft"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
