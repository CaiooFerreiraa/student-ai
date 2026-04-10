import { RouteLoadingShell } from "@/presentation/components/route-loading-shell";

export default function HistoryLoading() {
  return (
    <RouteLoadingShell
      description="Carregando resultados anteriores e revisão acumulada."
      eyebrow="Histórico"
      title="Buscando resultados"
    />
  );
}
