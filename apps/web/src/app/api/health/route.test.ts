import { NextRequest } from "next/server";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
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

  it("returns verbose diagnostics when requested", async () => {
    const request = new NextRequest("http://localhost:3000/api/health?verbose=true", {
      method: "GET",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("ok");
    expect(payload.security.runtime).toBe("nextjs-16");
  });
});
