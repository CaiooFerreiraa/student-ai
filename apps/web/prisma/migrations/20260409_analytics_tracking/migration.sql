ALTER TABLE "quiz_questions"
ADD COLUMN "topic" TEXT;

CREATE INDEX "results_userId_completedAt_idx" ON "results"("userId", "completedAt");
CREATE INDEX "quiz_questions_topic_idx" ON "quiz_questions"("topic");

CREATE TABLE "question_attempts" (
  "id" TEXT NOT NULL,
  "resultId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "quizId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "sessionOrder" INTEGER NOT NULL,
  "questionType" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "topic" TEXT,
  "isCorrect" BOOLEAN,
  "timeSpentMs" INTEGER NOT NULL,
  "selectedOption" INTEGER,
  "answerText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "question_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "question_attempts_resultId_sessionOrder_idx" ON "question_attempts"("resultId", "sessionOrder");
CREATE INDEX "question_attempts_userId_createdAt_idx" ON "question_attempts"("userId", "createdAt");
CREATE INDEX "question_attempts_userId_subjectId_createdAt_idx" ON "question_attempts"("userId", "subjectId", "createdAt");
CREATE INDEX "question_attempts_userId_difficulty_createdAt_idx" ON "question_attempts"("userId", "difficulty", "createdAt");
CREATE INDEX "question_attempts_userId_questionType_createdAt_idx" ON "question_attempts"("userId", "questionType", "createdAt");
CREATE INDEX "question_attempts_userId_topic_createdAt_idx" ON "question_attempts"("userId", "topic", "createdAt");
CREATE INDEX "question_attempts_quizId_idx" ON "question_attempts"("quizId");
CREATE INDEX "question_attempts_questionId_idx" ON "question_attempts"("questionId");

ALTER TABLE "question_attempts"
ADD CONSTRAINT "question_attempts_resultId_fkey"
FOREIGN KEY ("resultId") REFERENCES "results"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_attempts"
ADD CONSTRAINT "question_attempts_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_attempts"
ADD CONSTRAINT "question_attempts_quizId_fkey"
FOREIGN KEY ("quizId") REFERENCES "quizzes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_attempts"
ADD CONSTRAINT "question_attempts_subjectId_fkey"
FOREIGN KEY ("subjectId") REFERENCES "subjects"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_attempts"
ADD CONSTRAINT "question_attempts_questionId_fkey"
FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
