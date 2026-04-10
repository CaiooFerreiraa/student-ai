export type DocumentChunkEntity = {
  id: string;
  sourceDocumentId: string;
  sequence: number;
  content: string;
  tokenEstimate: number;
  embedding: number[];
  createdAt: Date;
};
