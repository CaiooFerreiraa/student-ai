import { RouteLoadingShell } from "@/presentation/components/route-loading-shell";

export default function ContextLoading() {
  return (
    <RouteLoadingShell
      description="Carregando fluxo de upload e inspeção de PDF."
      eyebrow="Upload de contexto"
      title="Preparando extração"
    />
  );
}
