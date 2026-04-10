import { ChatOpenAI } from "@langchain/openai";
import {
  type GeneratedQuizPayload,
  type QuizDifficulty,
  generatedQuizPayloadSchema,
  type GeneratedQuizQuestion,
} from "@/application/validators/quiz-generation-schemas";
import { getQuizDifficultyHint, getQuizDifficultyLabel } from "@/domain/value-objects/quiz-difficulty";
import { getServerEnv } from "@/infrastructure/config/env";
import { escapeHtml, sanitizeString } from "@/infrastructure/security/sanitize";

type GenerateQuizWithContextInput = {
  subjectName: string;
  title: string;
  difficulty: QuizDifficulty;
  questionCount: number;
  questionTypes: string[];
  contextSnippets: string[];
};

function getQuizGenerationModel(): string {
  const env = getServerEnv();
  return env.QUIZ_GENERATION_MODEL ?? "gpt-5.4-mini";
}

function normalizeModelContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item: unknown): string => {
        if (typeof item === "string") {
          return item;
        }

        if (typeof item === "object" && item !== null && "text" in item) {
          return String((item as { text: unknown }).text ?? "");
        }

        return "";
      })
      .join("\n");
  }

  return "";
}

function extractJsonPayload(rawContent: string): string {
  const fencedMatch: RegExpMatchArray | null = rawContent.match(/```json\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const startIndex: number = rawContent.indexOf("{");
  const endIndex: number = rawContent.lastIndexOf("}");

  if (startIndex >= 0 && endIndex > startIndex) {
    return rawContent.slice(startIndex, endIndex + 1);
  }

  return rawContent;
}

function normalizeQuestions(payload: GeneratedQuizPayload): GeneratedQuizPayload {
  const questions: GeneratedQuizQuestion[] = payload.questions.map(
    (question: GeneratedQuizQuestion): GeneratedQuizQuestion => {
      if (question.type === "true_false") {
        return {
          ...question,
          topic: question.topic ?? null,
          options: ["True", "False"],
        };
      }

      if (question.type === "essay") {
        return {
          ...question,
          topic: question.topic ?? null,
          options: null,
        };
      }

      return question;
    },
  );

  return {
    ...payload,
    questions,
  };
}

export async function generateQuizWithLangChain(
  input: GenerateQuizWithContextInput,
): Promise<{ model: string; quiz: GeneratedQuizPayload }> {
  const env = getServerEnv();

  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const model: string = getQuizGenerationModel();
  const llm = new ChatOpenAI({
    apiKey: env.OPENAI_API_KEY,
    model,
    temperature: 0.3,
  });

  const escapedContext: string = input.contextSnippets
    .map((chunk: string, index: number): string => `Contexto ${index + 1}:\n${escapeHtml(chunk)}`)
    .join("\n\n");

  const prompt: string = `
Você é um gerador de quizzes acadêmicos.
Gere um JSON válido e nada além do JSON.

Regras:
- Matéria: ${sanitizeString(input.subjectName)}
- Título sugerido: ${sanitizeString(input.title)}
- Dificuldade alvo: ${getQuizDifficultyLabel(input.difficulty)} (${input.difficulty})
- Diretriz do nível: ${getQuizDifficultyHint(input.difficulty)}
- Quantidade de questões: ${input.questionCount}
- Tipos permitidos: ${input.questionTypes.join(", ")}
- Baseie-se apenas no contexto enviado.
- Distribua a dificuldade de forma coerente com o nível solicitado.
- Nunca invente fatos ausentes do contexto.
- Cada questão deve incluir um campo "topic" com o subtópico principal em no máximo 5 palavras.
- Para "multiple_choice", gere exatamente 4 opções plausíveis.
- Para "true_false", use answer.correct como boolean.
- Para "essay", gere sampleAnswer e keyPoints.

Formato obrigatório:
{
  "title": "string",
  "description": "string",
  "questions": [
    {
      "type": "multiple_choice" | "true_false" | "essay",
      "difficulty": "ensino_medio" | "ensino_superior" | "pos_graduacao" | "doutorado" | "concurso",
      "topic": "string",
      "prompt": "string",
      "options": ["..."] | null,
      "answer": {},
      "explanation": "string"
    }
  ]
}

Contexto:
${escapedContext}
  `.trim();

  const response = await llm.invoke(prompt);
  const responseText: string = normalizeModelContent(response.content);
  const jsonPayload: string = extractJsonPayload(responseText);
  const parsedPayload = generatedQuizPayloadSchema.parse(JSON.parse(jsonPayload));

  return {
    model,
    quiz: normalizeQuestions(parsedPayload),
  };
}
