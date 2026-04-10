import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  analyticsFiltersSchema,
  paginatedHistoryQuerySchema,
  type AnalyticsFilters,
  type PaginatedHistoryQuery,
} from "@/application/validators/analytics-schemas";
import { getPaginatedHistory } from "@/application/use-cases/get-paginated-history";
import { isFeatureEnabled } from "@/infrastructure/config/feature-flags";
import { createApiRoute, createPreflightHandler } from "@/infrastructure/security/api-route";

type HistoryQuery = PaginatedHistoryQuery & AnalyticsFilters;

export const OPTIONS = createPreflightHandler();

export const GET = createApiRoute<undefined, HistoryQuery, undefined>(
  {
    query: paginatedHistoryQuerySchema.transform((query) => ({
      ...analyticsFiltersSchema.parse(query),
      page: query.page,
      pageSize: query.pageSize,
    })),
  },
  async ({
    query,
  }: {
    request: NextRequest;
    body: undefined;
    query: HistoryQuery;
    params: undefined;
  }) => {
    if (!isFeatureEnabled("analyticsApi")) {
      return NextResponse.json({ error: "Feature desabilitada." }, { status: 404 });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
    }

    const history = await getPaginatedHistory(session.user.id, query);
    return NextResponse.json(history);
  },
);
