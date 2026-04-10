import { OpenAIEmbeddings } from "@langchain/openai";
import { getServerEnv } from "@/infrastructure/config/env";
import type { DocumentChunkInput } from "@/infrastructure/documents/text-chunker";

export type EmbeddedDocumentChunk = DocumentChunkInput & {
  embedding: number[];
  score?: number;
};

function dotProduct(left: number[], right: number[]): number {
  return left.reduce((total: number, value: number, index: number) => total + value * (right[index] ?? 0), 0);
}

function magnitude(values: number[]): number {
  return Math.sqrt(values.reduce((total: number, value: number) => total + value * value, 0));
}

function cosineSimilarity(left: number[], right: number[]): number {
  const denominator: number = magnitude(left) * magnitude(right);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct(left, right) / denominator;
}

function getEmbeddingsClient(): OpenAIEmbeddings {
  const env = getServerEnv();

  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  return new OpenAIEmbeddings({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  });
}

export async function embedDocumentChunks(chunks: DocumentChunkInput[]): Promise<EmbeddedDocumentChunk[]> {
  const embeddings = getEmbeddingsClient();
  const vectors: number[][] = await embeddings.embedDocuments(
    chunks.map((chunk: DocumentChunkInput) => chunk.content),
  );

  return chunks.map(
    (chunk: DocumentChunkInput, index: number): EmbeddedDocumentChunk => ({
      ...chunk,
      embedding: vectors[index] ?? [],
    }),
  );
}

export async function rankDocumentChunks(
  chunks: EmbeddedDocumentChunk[],
  query: string,
  limit: number,
): Promise<EmbeddedDocumentChunk[]> {
  const embeddings = getEmbeddingsClient();
  const queryVector: number[] = await embeddings.embedQuery(query);

  return chunks
    .map(
      (chunk: EmbeddedDocumentChunk): EmbeddedDocumentChunk => ({
        ...chunk,
        score: cosineSimilarity(chunk.embedding, queryVector),
      }),
    )
    .sort((left: EmbeddedDocumentChunk, right: EmbeddedDocumentChunk) => (right.score ?? 0) - (left.score ?? 0))
    .slice(0, limit);
}
