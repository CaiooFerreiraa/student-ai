import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { generateQuizFromDocument, type QuizGenerationProgressEvent } from "@/application/use-cases/generate-quiz-from-document";
import {
  quizGenerationRequestSchema,
  type QuizGenerationRequest,
} from "@/application/validators/quiz-generation-schemas";
import { isFeatureEnabled } from "@/infrastructure/config/feature-flags";
import { createApiRoute, createPreflightHandler } from "@/infrastructure/security/api-route";
import { escapeHtml } from "@/infrastructure/security/sanitize";
import { isE2ETestMode } from "@/infrastructure/testing/e2e-mode";
import { getMockGeneratedQuizResult } from "@/infrastructure/testing/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type GenerateQuizRequestBody = QuizGenerationRequest;

type SseEventName = "progress" | "done" | "error";

function formatSseEvent(event: SseEventName, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export const OPTIONS = createPreflightHandler();

export const POST = createApiRoute<GenerateQuizRequestBody, undefined, undefined>(
  {
    body: quizGenerationRequestSchema,
  },
  async ({
    body,
  }: {
    request: NextRequest;
    body: GenerateQuizRequestBody;
    query: undefined;
    params: undefined;
  }) => {
    if (!isFeatureEnabled("quizGeneration")) {
      return NextResponse.json({ error: "Feature desabilitada." }, { status: 503 });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        void (async () => {
          const send = (event: SseEventName, payload: Record<string, unknown>): void => {
            controller.enqueue(encoder.encode(formatSseEvent(event, payload)));
          };

          try {
            const e2eMode = isE2ETestMode();
            if (e2eMode) {
              const result = getMockGeneratedQuizResult(body);

              for (const event of result.progress) {
                send("progress", {
                  ...event,
                  message: escapeHtml(event.message),
                });
              }

              send("done", {
                quizId: result.quizRecordId,
                cacheKey: result.cacheKey,
                fromCache: result.fromCache,
                model: result.model,
                subject: result.subject,
                quiz: result.quiz,
              });
              return;
            }

            const result = await generateQuizFromDocument(
                  {
                    ...body,
                    userId: session.user.id,
                  },
                  async (event: QuizGenerationProgressEvent) => {
                    send("progress", {
                      ...event,
                      message: escapeHtml(event.message),
                    });
                  },
                );

            send("done", {
              quizId: result.quizRecordId,
              cacheKey: result.cacheKey,
              fromCache: result.fromCache,
              model: result.model,
              subject: result.subject,
              quiz: result.quiz,
            });
          } catch (error: unknown) {
            const message: string =
              error instanceof Error ? escapeHtml(error.message) : "Falha ao gerar quiz.";

            send("error", {
              message,
            });
          } finally {
            controller.close();
          }
        })();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  },
);
