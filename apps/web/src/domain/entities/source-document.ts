export type SourceDocumentEntity = {
  id: string;
  subjectId: string;
  quizId: string;
  fileName: string;
  mimeType: string;
  checksum: string;
  rawText: string;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
};
