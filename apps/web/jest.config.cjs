/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/jest.env.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/application/validators/**/*.ts",
    "src/infrastructure/security/**/*.ts",
    "src/infrastructure/config/feature-flags.ts",
    "src/infrastructure/testing/e2e-mode.ts",
    "src/app/api/auth/register/route.ts",
    "src/app/api/analytics/overview/route.ts",
    "src/app/api/quiz/[quizId]/submit/route.ts",
    "src/app/api/quiz/generate/route.ts",
    "src/app/api/health/route.ts",
    "src/app/api/openapi/route.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],
  coverageProvider: "babel",
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};

module.exports = createJestConfig(customJestConfig);
