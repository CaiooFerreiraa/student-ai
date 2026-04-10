type OriginMatchResult = {
  allowed: boolean;
  origin: string | null;
};

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

function escapeRegexSegment(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createRegexFromPattern(pattern: string): RegExp {
  const normalizedPattern: string = normalizeOrigin(pattern);
  const expression: string = `^${normalizedPattern.split("*").map(escapeRegexSegment).join(".*")}$`;
  return new RegExp(expression);
}

function parseCsv(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry: string) => entry.trim())
    .filter((entry: string) => entry.length > 0);
}

export function getAllowedOrigins(): string[] {
  return parseCsv(process.env.SECURITY_CORS_ALLOWED_ORIGINS);
}

export function getAllowedOriginPatterns(): string[] {
  return parseCsv(process.env.SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS);
}

export function isOriginAllowed(origin: string | null): OriginMatchResult {
  if (!origin) {
    return {
      allowed: true,
      origin: null,
    };
  }

  const normalizedOrigin: string = normalizeOrigin(origin);
  const exactOrigins: string[] = getAllowedOrigins().map(normalizeOrigin);

  if (exactOrigins.includes(normalizedOrigin)) {
    return {
      allowed: true,
      origin: normalizedOrigin,
    };
  }

  const wildcardPatterns: string[] = getAllowedOriginPatterns();
  const matchesWildcard: boolean = wildcardPatterns.some((pattern: string) =>
    createRegexFromPattern(pattern).test(normalizedOrigin),
  );

  return {
    allowed: matchesWildcard,
    origin: normalizedOrigin,
  };
}
