import { createHash } from "node:crypto";
import pdfParse from "pdf-parse";
import { sanitizeString } from "@/infrastructure/security/sanitize";

export type ParsedPdfDocument = {
  checksum: string;
  fileName: string;
  mimeType: string;
  rawText: string;
};

export async function parsePdfUpload(file: File): Promise<ParsedPdfDocument> {
  const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
  const buffer: Buffer = Buffer.from(arrayBuffer);
  const checksum: string = createHash("sha256").update(buffer).digest("hex");
  const parsed = await pdfParse(buffer);
  const rawText: string = sanitizeString(parsed.text ?? "");

  if (rawText.length < 40) {
    throw new Error("O PDF enviado não possui texto suficiente para gerar um quiz.");
  }

  return {
    checksum,
    fileName: sanitizeString(file.name),
    mimeType: file.type || "application/pdf",
    rawText,
  };
}
