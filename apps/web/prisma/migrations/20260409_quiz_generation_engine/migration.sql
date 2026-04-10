ALTER TABLE "quizzes"
ADD COLUMN "generationModel" TEXT,
ADD COLUMN "generationStatus" TEXT NOT NULL DEFAULT 'ready',
ADD COLUMN "cacheKey" TEXT;

CREATE UNIQUE INDEX "quizzes_cacheKey_key" ON "quizzes"("cacheKey");

CREATE TABLE "source_documents" (
  "id" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "quizId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "checksum" TEXT NOT NULL,
  "rawText" TEXT NOT NULL,
  "chunkCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "source_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_chunks" (
  "id" TEXT NOT NULL,
  "sourceDocumentId" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "tokenEstimate" INTEGER NOT NULL DEFAULT 0,
  "embedding" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quiz_questions" (
  "id" TEXT NOT NULL,
  "quizId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "options" JSONB,
  "answer" JSONB NOT NULL,
  "explanation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "generated_quiz_cache" (
  "id" TEXT NOT NULL,
  "cacheKey" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "quizId" TEXT,
  "sourceChecksum" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "questionCount" INTEGER NOT NULL,
  "questionTypes" JSONB NOT NULL,
  "responseJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "generated_quiz_cache_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "source_documents_subjectId_idx" ON "source_documents"("subjectId");
CREATE INDEX "source_documents_quizId_idx" ON "source_documents"("quizId");
CREATE INDEX "document_chunks_sourceDocumentId_sequence_idx" ON "document_chunks"("sourceDocumentId", "sequence");
CREATE UNIQUE INDEX "quiz_questions_quizId_position_key" ON "quiz_questions"("quizId", "position");
CREATE INDEX "quiz_questions_type_idx" ON "quiz_questions"("type");
CREATE UNIQUE INDEX "generated_quiz_cache_cacheKey_key" ON "generated_quiz_cache"("cacheKey");
CREATE UNIQUE INDEX "generated_quiz_cache_quizId_key" ON "generated_quiz_cache"("quizId");
CREATE INDEX "generated_quiz_cache_subjectId_idx" ON "generated_quiz_cache"("subjectId");
CREATE INDEX "generated_quiz_cache_expiresAt_idx" ON "generated_quiz_cache"("expiresAt");

ALTER TABLE "source_documents"
ADD CONSTRAINT "source_documents_subjectId_fkey"
FOREIGN KEY ("subjectId") REFERENCES "subjects"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "source_documents"
ADD CONSTRAINT "source_documents_quizId_fkey"
FOREIGN KEY ("quizId") REFERENCES "quizzes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "document_chunks"
ADD CONSTRAINT "document_chunks_sourceDocumentId_fkey"
FOREIGN KEY ("sourceDocumentId") REFERENCES "source_documents"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_questions"
ADD CONSTRAINT "quiz_questions_quizId_fkey"
FOREIGN KEY ("quizId") REFERENCES "quizzes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "generated_quiz_cache"
ADD CONSTRAINT "generated_quiz_cache_subjectId_fkey"
FOREIGN KEY ("subjectId") REFERENCES "subjects"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "generated_quiz_cache"
ADD CONSTRAINT "generated_quiz_cache_quizId_fkey"
FOREIGN KEY ("quizId") REFERENCES "quizzes"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
