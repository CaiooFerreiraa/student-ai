import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export type DocumentChunkInput = {
  sequence: number;
  content: string;
  tokenEstimate: number;
};

export async function chunkDocumentText(rawText: string): Promise<DocumentChunkInput[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 180,
  });

  const chunks: string[] = await splitter.splitText(rawText);

  return chunks
    .map((content: string, index: number): DocumentChunkInput => ({
      sequence: index,
      content,
      tokenEstimate: Math.ceil(content.length / 4),
    }))
    .filter((chunk: DocumentChunkInput) => chunk.content.length > 0);
}
