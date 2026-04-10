import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  analyticsFiltersSchema,
  analyticsQuerySchema,
  type AnalyticsFilters,
} from "@/application/validators/analytics-schemas";
import { getAnalyticsOverview } from "@/application/use-cases/get-analytics-overview";
import { isFeatureEnabled } from "@/infrastructure/config/feature-flags";
import { createApiRoute, createPreflightHandler } from "@/infrastructure/security/api-route";

export const OPTIONS = createPreflightHandler();

export const GET = createApiRoute<undefined, AnalyticsFilters, undefined>(
  {
    query: analyticsQuerySchema.transform((query) => analyticsFiltersSchema.parse(query)),
  },
  async ({
    query,
  }: {
    request: NextRequest;
    body: undefined;
    query: AnalyticsFilters;
    params: undefined;
  }) => {
    if (!isFeatureEnabled("analyticsApi")) {
      return NextResponse.json({ error: "Feature desabilitada." }, { status: 404 });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
    }

    const overview = await getAnalyticsOverview(session.user.id, query);

    return NextResponse.json(overview);
  },
);
