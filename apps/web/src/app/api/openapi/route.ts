import { NextResponse } from "next/server";
import { isFeatureEnabled } from "@/infrastructure/config/feature-flags";
import { getOpenApiDocument } from "@/infrastructure/docs/openapi";

export async function GET(): Promise<Response> {
  if (!isFeatureEnabled("apiDocs")) {
    return NextResponse.json({ error: "Feature desabilitada." }, { status: 404 });
  }

  return NextResponse.json(getOpenApiDocument(), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
