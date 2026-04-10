import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: `bun run --bun next dev --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/student_ai",
      AUTH_SECRET: "12345678901234567890123456789012",
      AUTH_TRUST_HOST: "true",
      AUTH_URL: baseURL,
      SECURITY_CORS_ALLOWED_ORIGINS: `${baseURL},http://localhost:3000`,
      SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS: "https://student-ai-*.vercel.app",
      FEATURE_ANALYTICS_API: "true",
      FEATURE_ANALYTICS_DASHBOARD: "true",
      FEATURE_QUIZ_GENERATION: "true",
      FEATURE_EXPORT_REPORTS: "true",
      FEATURE_API_DOCS: "true",
      FEATURE_SENTRY: "false",
      E2E_TEST_MODE: "true",
      LOCAL_RATE_LIMIT_MODE: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
