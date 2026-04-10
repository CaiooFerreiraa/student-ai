import Link from "next/link";

type HistoryPaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export function HistoryPagination({ page, totalPages, buildHref }: HistoryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink-soft">
        Página {page} de {totalPages}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          aria-disabled={page <= 1}
          className={`ui-button-secondary ${page <= 1 ? "pointer-events-none opacity-60" : ""}`}
          href={buildHref(Math.max(1, page - 1))}
        >
          Anterior
        </Link>
        <Link
          aria-disabled={page >= totalPages}
          className={`ui-button-primary ${page >= totalPages ? "pointer-events-none opacity-60" : ""}`}
          href={buildHref(Math.min(totalPages, page + 1))}
        >
          Próxima
        </Link>
      </div>
    </div>
  );
}
