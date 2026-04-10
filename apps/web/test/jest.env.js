process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/student_ai";
process.env.AUTH_SECRET = process.env.AUTH_SECRET || "12345678901234567890123456789012";
process.env.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST || "true";
process.env.AUTH_URL = process.env.AUTH_URL || "http://localhost:3000";
process.env.FEATURE_ANALYTICS_API = process.env.FEATURE_ANALYTICS_API || "true";
process.env.FEATURE_ANALYTICS_DASHBOARD = process.env.FEATURE_ANALYTICS_DASHBOARD || "true";
process.env.FEATURE_QUIZ_GENERATION = process.env.FEATURE_QUIZ_GENERATION || "true";
process.env.FEATURE_EXPORT_REPORTS = process.env.FEATURE_EXPORT_REPORTS || "true";
process.env.FEATURE_API_DOCS = process.env.FEATURE_API_DOCS || "true";
process.env.FEATURE_SENTRY = process.env.FEATURE_SENTRY || "false";
process.env.LOCAL_RATE_LIMIT_MODE = process.env.LOCAL_RATE_LIMIT_MODE || "true";
process.env.CUSTOM_DOMAIN = process.env.CUSTOM_DOMAIN || "student-ai.app";
process.env.SECURITY_CORS_ALLOWED_ORIGINS =
  process.env.SECURITY_CORS_ALLOWED_ORIGINS || "http://localhost:3000,https://student-ai.vercel.app";
process.env.SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS =
  process.env.SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS || "https://student-ai-*.vercel.app";
