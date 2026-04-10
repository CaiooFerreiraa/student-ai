import { getAllowedOriginPatterns, getAllowedOrigins, isOriginAllowed } from "@/infrastructure/security/origin";

const ORIGINAL_ALLOWED_ORIGINS: string | undefined = process.env.SECURITY_CORS_ALLOWED_ORIGINS;
const ORIGINAL_ALLOWED_PATTERNS: string | undefined = process.env.SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS;

describe("origin security", () => {
  beforeEach(() => {
    process.env.SECURITY_CORS_ALLOWED_ORIGINS = "http://localhost:3000,https://student-ai.vercel.app";
    process.env.SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS = "https://student-ai-*.vercel.app";
  });

  afterEach(() => {
    process.env.SECURITY_CORS_ALLOWED_ORIGINS = ORIGINAL_ALLOWED_ORIGINS;
    process.env.SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS = ORIGINAL_ALLOWED_PATTERNS;
  });

  it("reads exact allowed origins from env", () => {
    expect(getAllowedOrigins()).toEqual([
      "http://localhost:3000",
      "https://student-ai.vercel.app",
    ]);
  });

  it("reads wildcard origin patterns from env", () => {
    expect(getAllowedOriginPatterns()).toEqual(["https://student-ai-*.vercel.app"]);
  });

  it("allows exact origin matches", () => {
    expect(isOriginAllowed("https://student-ai.vercel.app").allowed).toBe(true);
  });

  it("allows requests without origin header", () => {
    expect(isOriginAllowed(null)).toEqual({
      allowed: true,
      origin: null,
    });
  });

  it("allows preview vercel origins by pattern", () => {
    expect(isOriginAllowed("https://student-ai-git-main-team.vercel.app").allowed).toBe(true);
  });

  it("rejects unknown origins", () => {
    expect(isOriginAllowed("https://malicious.example.com").allowed).toBe(false);
  });
});
