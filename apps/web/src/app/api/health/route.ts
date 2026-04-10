import { NextResponse, type NextRequest } from "next/server";
import { healthQuerySchema } from "@/application/validators/api-security-schemas";
import { createApiRoute, createPreflightHandler } from "@/infrastructure/security/api-route";

type HealthQuery = {
  verbose: boolean;
};

export const OPTIONS = createPreflightHandler();

export const GET = createApiRoute<undefined, HealthQuery, undefined>(
  {
    query: healthQuerySchema,
  },
  async ({
    request,
    query,
  }: {
    request: NextRequest;
    query: HealthQuery;
    body: undefined;
    params: undefined;
  }) => {
    const payload: Record<string, unknown> = {
      status: "ok",
      timestamp: new Date().toISOString(),
    };

    if (query.verbose) {
      payload.security = {
        corsOrigin: request.headers.get("origin"),
        runtime: "nextjs-16",
      };
    }

    return NextResponse.json(payload, { status: 200 });
  },
);
