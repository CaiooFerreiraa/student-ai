export const quizDifficultyValues = [
  "ensino_medio",
  "ensino_superior",
  "pos_graduacao",
  "doutorado",
  "concurso",
] as const;

export type QuizDifficulty = (typeof quizDifficultyValues)[number];

type QuizDifficultyDefinition = {
  value: QuizDifficulty;
  label: string;
  hint: string;
};

const quizDifficultyDefinitions: readonly QuizDifficultyDefinition[] = [
  {
    value: "ensino_medio",
    label: "Ensino médio",
    hint: "Base conceitual, leitura direta e revisão escolar.",
  },
  {
    value: "ensino_superior",
    label: "Ensino superior",
    hint: "Graduação com aplicação, síntese e vocabulário técnico.",
  },
  {
    value: "pos_graduacao",
    label: "Pós-graduação",
    hint: "Aprofundamento teórico com interpretação crítica.",
  },
  {
    value: "doutorado",
    label: "Doutorado",
    hint: "Abstração alta, rigor metodológico e argumentação densa.",
  },
  {
    value: "concurso",
    label: "Concurso",
    hint: "Objetividade, precisão normativa e pressão de prova.",
  },
] as const;

const quizDifficultyAliasMap: Record<string, QuizDifficulty> = {
  easy: "ensino_medio",
  ensino_medio: "ensino_medio",
  medio: "ensino_medio",
  medium: "ensino_superior",
  intermediate: "ensino_superior",
  ensino_superior: "ensino_superior",
  superior: "ensino_superior",
  graduacao: "ensino_superior",
  graduacao_superior: "ensino_superior",
  pos_graduacao: "pos_graduacao",
  posgraduacao: "pos_graduacao",
  mestrado: "pos_graduacao",
  hard: "doutorado",
  doutorado: "doutorado",
  concurso: "concurso",
};

function normalizeDifficultyKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function toReadableLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((token: string) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export const quizDifficultyOptions = quizDifficultyDefinitions;

export function normalizeQuizDifficulty(value: string | null | undefined): QuizDifficulty | null {
  if (!value) {
    return null;
  }

  return quizDifficultyAliasMap[normalizeDifficultyKey(value)] ?? null;
}

export function getQuizDifficultyLabel(value: string | null | undefined): string {
  if (!value) {
    return "Nível não informado";
  }

  const normalizedDifficulty = normalizeQuizDifficulty(value);

  if (!normalizedDifficulty) {
    return toReadableLabel(value);
  }

  return quizDifficultyDefinitions.find((difficulty) => difficulty.value === normalizedDifficulty)?.label ?? value;
}

export function getQuizDifficultyHint(value: string | null | undefined): string {
  const normalizedDifficulty = normalizeQuizDifficulty(value);

  if (!normalizedDifficulty) {
    return "Nível sem mapeamento semântico definido.";
  }

  return quizDifficultyDefinitions.find((difficulty) => difficulty.value === normalizedDifficulty)?.hint ?? "";
}
