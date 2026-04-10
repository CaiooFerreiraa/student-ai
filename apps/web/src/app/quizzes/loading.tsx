import { RouteLoadingShell } from "@/presentation/components/route-loading-shell";

export default function QuizzesLoading() {
  return (
    <RouteLoadingShell
      description="Carregando geração ou resolução do quiz."
      eyebrow="Quizzes"
      title="Preparando fluxo"
    />
  );
}
