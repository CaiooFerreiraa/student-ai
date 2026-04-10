import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { getSessionReport } from "@/application/use-cases/get-session-report";
import { sessionReportParamsSchema } from "@/application/validators/analytics-schemas";
import { isFeatureEnabled } from "@/infrastructure/config/feature-flags";
import { createApiRoute, createPreflightHandler } from "@/infrastructure/security/api-route";

type SessionParams = {
  resultId: string;
};

export const OPTIONS = createPreflightHandler();

export const GET = createApiRoute<undefined, undefined, SessionParams>(
  {
    params: sessionReportParamsSchema,
  },
  async ({
    params,
  }: {
    request: NextRequest;
    body: undefined;
    query: undefined;
    params: SessionParams;
  }) => {
    if (!isFeatureEnabled("analyticsApi") || !isFeatureEnabled("exportReports")) {
      return NextResponse.json({ error: "Feature desabilitada." }, { status: 404 });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
    }

    const report = await getSessionReport(session.user.id, params.resultId);

    if (!report) {
      return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
    }

    return NextResponse.json(report);
  },
);
