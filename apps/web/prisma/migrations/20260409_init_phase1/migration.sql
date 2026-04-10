-- Initial phase 1 schema for student-ai
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT,
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subjects" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quizzes" (
  "id" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "difficulty" TEXT NOT NULL DEFAULT 'intermediate',
  "totalQuestions" INTEGER NOT NULL DEFAULT 10,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "results" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "quizId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "correctAnswers" INTEGER NOT NULL,
  "totalQuestions" INTEGER NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "subjects_name_key" ON "subjects"("name");
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects"("slug");
CREATE INDEX "quizzes_subjectId_idx" ON "quizzes"("subjectId");
CREATE INDEX "results_userId_idx" ON "results"("userId");
CREATE INDEX "results_quizId_idx" ON "results"("quizId");

ALTER TABLE "quizzes"
ADD CONSTRAINT "quizzes_subjectId_fkey"
FOREIGN KEY ("subjectId") REFERENCES "subjects"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "results"
ADD CONSTRAINT "results_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "results"
ADD CONSTRAINT "results_quizId_fkey"
FOREIGN KEY ("quizId") REFERENCES "quizzes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
