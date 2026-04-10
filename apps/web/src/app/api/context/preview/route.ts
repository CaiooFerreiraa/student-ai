import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  contextPreviewRequestSchema,
  type ContextPreviewRequest,
} from "@/application/validators/quiz-generation-schemas";
import { createApiRoute, createPreflightHandler } from "@/infrastructure/security/api-route";
import { parsePdfUpload } from "@/infrastructure/documents/pdf-parser";
import { chunkDocumentText } from "@/infrastructure/documents/text-chunker";
import { findSubjectById } from "@/infrastructure/repositories/prisma-quiz-generation-repository";

export const runtime = "nodejs";
export const maxDuration = 60;

type ContextPreviewBody = ContextPreviewRequest;

export const OPTIONS = createPreflightHandler();

export const POST = createApiRoute<ContextPreviewBody, undefined, undefined>(
  {
    body: contextPreviewRequestSchema,
  },
  async ({
    body,
  }: {
    request: NextRequest;
    body: ContextPreviewBody;
    query: undefined;
    params: undefined;
  }) => {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
    }

    const subject = await findSubjectById(body.subjectId);

    if (!subject) {
      return NextResponse.json({ error: "Matéria não encontrada." }, { status: 404 });
    }

    const parsedDocument = await parsePdfUpload(body.pdf);
    const chunks = await chunkDocumentText(parsedDocument.rawText);

    return NextResponse.json(
      {
        subject: {
          id: subject.id,
          name: subject.name,
        },
        preview: {
          fileName: parsedDocument.fileName,
          checksum: parsedDocument.checksum,
          characterCount: parsedDocument.rawText.length,
          chunkCount: chunks.length,
          excerpt: parsedDocument.rawText.slice(0, 700),
          firstChunks: chunks.slice(0, 3).map((chunk) => ({
            sequence: chunk.sequence,
            content: chunk.content.slice(0, 260),
            tokenEstimate: chunk.tokenEstimate,
          })),
        },
      },
      { status: 200 },
    );
  },
);
