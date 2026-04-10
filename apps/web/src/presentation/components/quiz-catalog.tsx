"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpenText, CalendarRange, Search, SlidersHorizontal } from "lucide-react";
import {
  getQuizDifficultyLabel,
  normalizeQuizDifficulty,
  quizDifficultyOptions,
} from "@/domain/value-objects/quiz-difficulty";

type CatalogItem = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  totalQuestions: number;
  updatedAt: string;
  subject: {
    id: string;
    name: string;
    slug: string;
  };
  resultCount: number;
};

type QuizCatalogProps = {
  items: CatalogItem[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function QuizCatalog({ items }: QuizCatalogProps) {
  const [query, setQuery] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const subjects = useMemo<string[]>(() => Array.from(new Set(items.map((item) => item.subject.name))), [items]);

  const filteredItems = useMemo<CatalogItem[]>(() => {
    return items.filter((item: CatalogItem) => {
      const matchesQuery: boolean =
        query.length === 0 ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subject.name.toLowerCase().includes(query.toLowerCase());
      const matchesSubject: boolean = subjectFilter === "all" || item.subject.name === subjectFilter;
      const matchesDifficulty: boolean =
        difficultyFilter === "all" || normalizeQuizDifficulty(item.difficulty) === difficultyFilter;

      return matchesQuery && matchesSubject && matchesDifficulty;
    });
  }, [difficultyFilter, items, query, subjectFilter]);

  return (
    <section className="space-y-5">
      <div className="ui-panel flex flex-col gap-4 px-5 py-5 sm:px-6 lg:px-7 lg:py-6">
        <div className="flex items-center gap-3 text-ink-soft">
          <SlidersHorizontal className="h-4 w-4 text-accent" />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Filtro de catálogo</p>
        </div>
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr]">
          <label className="relative block">
            <span className="ui-label">Busca</span>
            <Search className="pointer-events-none absolute left-4 top-[2.7rem] h-4 w-4 text-ink-soft" />
            <input
              className="ui-input pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por quiz ou matéria"
              value={query}
            />
          </label>

          <label>
            <span className="ui-label">Matéria</span>
            <select
              className="ui-select"
              onChange={(event) => setSubjectFilter(event.target.value)}
              value={subjectFilter}
            >
              <option value="all">Todas</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="ui-label">Dificuldade</span>
            <select
              className="ui-select"
              onChange={(event) => setDifficultyFilter(event.target.value)}
              value={difficultyFilter}
            >
              <option value="all">Todas</option>
              {quizDifficultyOptions.map((difficultyOption) => (
                <option key={difficultyOption.value} value={difficultyOption.value}>
                  {difficultyOption.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-2">
        {filteredItems.map((item: CatalogItem) => (
          <article className="ui-panel-cut ui-surface-noise min-w-0 px-5 py-5 sm:px-6 lg:px-7 lg:py-6" key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-[42rem]">
                <div className="flex flex-wrap gap-2">
                  <span className="ui-badge">{item.subject.name}</span>
                  <span className="ui-badge">{getQuizDifficultyLabel(item.difficulty)}</span>
                </div>
                <h3 className="mt-4 text-balance font-[var(--font-display)] text-[1.8rem] font-extrabold uppercase leading-[0.92] tracking-[-0.08em] text-ink lg:text-[2rem]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-[36rem] text-sm leading-7 text-ink-soft">
                  {item.description ?? "Sem descrição adicional para este quiz."}
                </p>
              </div>
              <BookOpenText className="h-5 w-5 text-accent" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
              <span>{item.totalQuestions} questões</span>
              <span>{item.resultCount} tentativas</span>
              <span className="inline-flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                {formatDate(item.updatedAt)}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="ui-button-primary" href={`/quizzes/${item.id}`}>
                Resolver
              </Link>
              <Link className="ui-button-secondary" href="/quizzes/new">
                Gerar variação
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
