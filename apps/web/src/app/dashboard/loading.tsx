import { RouteLoadingShell } from "@/presentation/components/route-loading-shell";

export default function DashboardLoading() {
  return (
    <RouteLoadingShell
      description="Carregando catálogo, métricas e ritmo recente do estudo."
      eyebrow="Dashboard"
      title="Preparando painel"
    />
  );
}
