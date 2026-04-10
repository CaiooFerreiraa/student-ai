import { z } from "zod";

function emptyStringToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  return value === "true";
}

const optionalStringSchema = z.preprocess(emptyStringToUndefined, z.string().optional());
const optionalUrlSchema = z.preprocess(emptyStringToUndefined, z.string().url().optional());
const optionalBooleanSchema = z.preprocess(parseBoolean, z.boolean().optional());

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: optionalUrlSchema,
  OPENAI_API_KEY: z.preprocess(emptyStringToUndefined, z.string().startsWith("sk-").optional()),
  QUIZ_GENERATION_MODEL: optionalStringSchema,
  OPENAI_EMBEDDING_MODEL: optionalStringSchema,
  AUTH_TRUST_HOST: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  GOOGLE_CLIENT_ID: optionalStringSchema,
  GOOGLE_CLIENT_SECRET: optionalStringSchema,
  GITHUB_CLIENT_ID: optionalStringSchema,
  GITHUB_CLIENT_SECRET: optionalStringSchema,
  UPSTASH_REDIS_REST_URL: optionalUrlSchema,
  UPSTASH_REDIS_REST_TOKEN: optionalStringSchema,
  SECURITY_CORS_ALLOWED_ORIGINS: optionalStringSchema,
  SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS: optionalStringSchema,
  SENTRY_DSN: optionalUrlSchema,
  NEXT_PUBLIC_SENTRY_DSN: optionalUrlSchema,
  SENTRY_ORG: optionalStringSchema,
  SENTRY_PROJECT: optionalStringSchema,
  SENTRY_AUTH_TOKEN: optionalStringSchema,
  FEATURE_ANALYTICS_API: optionalBooleanSchema,
  FEATURE_ANALYTICS_DASHBOARD: optionalBooleanSchema,
  FEATURE_QUIZ_GENERATION: optionalBooleanSchema,
  FEATURE_EXPORT_REPORTS: optionalBooleanSchema,
  FEATURE_API_DOCS: optionalBooleanSchema,
  FEATURE_SENTRY: optionalBooleanSchema,
  E2E_TEST_MODE: optionalBooleanSchema,
  LOCAL_RATE_LIMIT_MODE: optionalBooleanSchema,
  CUSTOM_DOMAIN: optionalStringSchema,
  DEV_ALLOWED_ORIGINS: optionalStringSchema,
});

type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}
