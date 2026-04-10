import { getServerEnv } from "@/infrastructure/config/env";
import { quizDifficultyValues } from "@/domain/value-objects/quiz-difficulty";

function buildServerUrl(): string {
  const env = getServerEnv();

  if (env.AUTH_URL) {
    return env.AUTH_URL;
  }

  if (env.CUSTOM_DOMAIN) {
    return env.CUSTOM_DOMAIN.startsWith("http") ? env.CUSTOM_DOMAIN : `https://${env.CUSTOM_DOMAIN}`;
  }

  return "http://localhost:3000";
}

export function getOpenApiDocument() {
  const serverUrl = buildServerUrl();

  return {
    openapi: "3.1.0",
    info: {
      title: "student-ai API",
      version: "1.0.0",
      description:
        "API protegida do student-ai para registro, preview de contexto, geração de quiz, submissão e analytics.",
    },
    servers: [
      {
        url: serverUrl,
      },
    ],
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Context" },
      { name: "Quiz" },
      { name: "Analytics" },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "authjs.session-token",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
          required: ["error"],
        },
        RegisterRequest: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
          required: ["name", "email", "password"],
        },
        QuizSubmissionRequest: {
          type: "object",
          properties: {
            quizId: { type: "string" },
            score: { type: "number", minimum: 0, maximum: 100 },
            correctAnswers: { type: "integer", minimum: 0 },
            totalQuestions: { type: "integer", minimum: 1 },
            attempts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  questionId: { type: "string" },
                  sessionOrder: { type: "integer", minimum: 0 },
                  questionType: { type: "string", enum: ["multiple_choice", "true_false", "essay"] },
                  difficulty: { type: "string", enum: [...quizDifficultyValues] },
                  topic: { type: ["string", "null"] },
                  isCorrect: { type: ["boolean", "null"] },
                  timeSpentMs: { type: "integer", minimum: 0 },
                  selectedOption: { type: ["integer", "null"] },
                  answerText: { type: ["string", "null"] },
                },
                required: [
                  "questionId",
                  "sessionOrder",
                  "questionType",
                  "difficulty",
                  "isCorrect",
                  "timeSpentMs",
                ],
              },
            },
          },
          required: ["quizId", "score", "correctAnswers", "totalQuestions", "attempts"],
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Healthcheck protegido por CORS",
          parameters: [
            {
              name: "verbose",
              in: "query",
              schema: {
                type: "boolean",
              },
            },
          ],
          responses: {
            "200": {
              description: "Serviço disponível",
            },
          },
        },
      },
      "/api/openapi": {
        get: {
          tags: ["Health"],
          summary: "Documento OpenAPI",
          responses: {
            "200": {
              description: "Especificação OpenAPI 3.1 da aplicação",
            },
          },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Registro por e-mail e senha",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterRequest",
                },
              },
            },
          },
          responses: {
            "201": { description: "Conta criada" },
            "409": {
              description: "Conflito de e-mail",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/context/preview": {
        post: {
          tags: ["Context"],
          summary: "Extrai preview do PDF enviado",
          security: [{ sessionCookie: [] }],
          responses: {
            "200": { description: "Preview gerado" },
            "401": { description: "Autenticação obrigatória" },
          },
        },
      },
      "/api/quiz/generate": {
        post: {
          tags: ["Quiz"],
          summary: "Gera quiz contextualizado com SSE",
          security: [{ sessionCookie: [] }],
          responses: {
            "200": { description: "Fluxo SSE iniciado" },
            "401": { description: "Autenticação obrigatória" },
            "503": { description: "Feature temporariamente desligada" },
          },
        },
      },
      "/api/quiz/{quizId}/submit": {
        post: {
          tags: ["Quiz"],
          summary: "Persistência do resultado da sessão",
          security: [{ sessionCookie: [] }],
          parameters: [
            {
              name: "quizId",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QuizSubmissionRequest",
                },
              },
            },
          },
          responses: {
            "201": { description: "Resultado salvo" },
            "400": { description: "Payload inválido" },
            "401": { description: "Autenticação obrigatória" },
          },
        },
      },
      "/api/analytics/overview": {
        get: {
          tags: ["Analytics"],
          summary: "Overview analítico agregado",
          security: [{ sessionCookie: [] }],
          responses: {
            "200": { description: "Overview carregado" },
            "401": { description: "Autenticação obrigatória" },
            "404": { description: "Feature temporariamente desligada" },
          },
        },
      },
      "/api/analytics/history": {
        get: {
          tags: ["Analytics"],
          summary: "Histórico paginado com filtros",
          security: [{ sessionCookie: [] }],
          responses: {
            "200": { description: "Histórico carregado" },
            "401": { description: "Autenticação obrigatória" },
          },
        },
      },
      "/api/analytics/sessions/{resultId}": {
        get: {
          tags: ["Analytics"],
          summary: "Relatório detalhado por sessão",
          security: [{ sessionCookie: [] }],
          parameters: [
            {
              name: "resultId",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": { description: "Relatório carregado" },
            "401": { description: "Autenticação obrigatória" },
            "404": { description: "Feature temporariamente desligada" },
          },
        },
      },
    },
  };
}
