import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createApiRoute, createPreflightHandler } from "@/infrastructure/security/api-route";

describe("api route wrapper", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SECURITY_CORS_ALLOWED_ORIGINS: "http://localhost:3000,https://student-ai.vercel.app",
      SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS: "https://student-ai-*.vercel.app",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("validates request payloads and rejects invalid bodies", async () => {
    const POST = createApiRoute(
      {
        body: z.object({
          name: z.string().min(2),
        }),
      },
      async () => NextResponse.json({ ok: true }),
    );

    const request = new NextRequest("http://localhost:3000/api/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ name: "A" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid request body.");
  });

  it("rejects disallowed origins", async () => {
    const GET = createApiRoute({}, async () => NextResponse.json({ ok: true }));
    const request = new NextRequest("http://localhost:3000/api/test", {
      method: "GET",
      headers: {
        origin: "https://malicious.example.com",
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(403);
  });

  it("propagates route params after validation", async () => {
    const GET = createApiRoute(
      {
        params: z.object({
          id: z.string().min(1),
        }),
      },
      async ({ params }) => NextResponse.json({ id: params.id }),
    );

    const request = new NextRequest("http://localhost:3000/api/test/abc", {
      method: "GET",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const response = await GET(request, { params: Promise.resolve({ id: "abc" }) });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.id).toBe("abc");
  });

  it("validates query parameters", async () => {
    const GET = createApiRoute(
      {
        query: z.object({
          page: z.coerce.number().int().min(1),
        }),
      },
      async ({ query }) => NextResponse.json({ page: query.page }),
    );

    const request = new NextRequest("http://localhost:3000/api/test?page=0", {
      method: "GET",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid query parameters.");
  });

  it("returns 500 for unhandled handler errors", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const GET = createApiRoute({}, async () => {
      throw new Error("boom");
    });

    const request = new NextRequest("http://localhost:3000/api/test", {
      method: "GET",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Internal server error.");

    consoleSpy.mockRestore();
  });

  it("handles CORS preflight requests", async () => {
    const OPTIONS = createPreflightHandler();
    const request = new NextRequest("http://localhost:3000/api/test", {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
  });

  it("rejects blocked origins on preflight", async () => {
    const OPTIONS = createPreflightHandler();
    const request = new NextRequest("http://localhost:3000/api/test", {
      method: "OPTIONS",
      headers: {
        origin: "https://malicious.example.com",
      },
    });

    const response = await OPTIONS(request);

    expect(response.status).toBe(403);
  });
});
