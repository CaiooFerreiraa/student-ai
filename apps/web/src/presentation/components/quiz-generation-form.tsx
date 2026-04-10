"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CheckSquare, LoaderCircle, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  type QuizDifficulty,
  quizGenerationRequestSchema,
  quizQuestionTypeValues,
  type QuizGenerationRequest,
} from "@/application/validators/quiz-generation-schemas";
import {
  getQuizDifficultyHint,
  getQuizDifficultyLabel,
  quizDifficultyOptions,
} from "@/domain/value-objects/quiz-difficulty";

type QuizGenerationFormProps = {
  subjects: Array<{
    id: string;
    name: string;
  }>;
};

type QuizGenerationResult = {
  quizId: string;
  cacheKey: string;
  fromCache: boolean;
  model: string;
  subject: {
    id: string;
    name: string;
    slug: string;
  };
  quiz: {
    title: string;
    description: string;
    questions: Array<{
      type: string;
      prompt: string;
    }>;
  };
};

type GenerationProgressEvent = {
  step: string;
  message: string;
  metadata?: Record<string, unknown>;
};

type QuizGenerationSseEvent =
  | { event: "progress"; data: GenerationProgressEvent }
  | { event: "done"; data: QuizGenerationResult }
  | { event: "error"; data: { message: string } };

type QuizGenerationFormValues = QuizGenerationRequest;
type QuizGenerationFormInput = z.input<typeof quizGenerationRequestSchema>;

function getQuestionTypeLabel(questionType: string): string {
  if (questionType === "multiple_choice") {
    return "Múltipla escolha";
  }

  if (questionType === "true_false") {
    return "Verdadeiro ou falso";
  }

  return "Dissertativa";
}

function parseSseEvent(rawEvent: string): QuizGenerationSseEvent | null {
  const lines: string[] = rawEvent.split("\n").filter((line: string) => line.trim().length > 0);
  const eventLine: string | undefined = lines.find((line: string) => line.startsWith("event:"));
  const dataLine: string | undefined = lines.find((line: string) => line.startsWith("data:"));

  if (!eventLine || !dataLine) {
    return null;
  }

  const event = eventLine.replace("event:", "").trim();
  const data = JSON.parse(dataLine.replace("data:", "").trim()) as unknown;

  if (event === "progress") {
    return {
      event,
      data: data as GenerationProgressEvent,
    };
  }

  if (event === "done") {
    return {
      event,
      data: data as QuizGenerationResult,
    };
  }

  if (event === "error") {
    return {
      event,
      data: data as { message: string },
    };
  }

  return null;
}

export function QuizGenerationForm({ subjects }: QuizGenerationFormProps) {
  const router = useRouter();
  const [progressEvents, setProgressEvents] = useState<GenerationProgressEvent[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>("Nenhum PDF anexado");
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<QuizGenerationFormInput, unknown, QuizGenerationFormValues>({
    resolver: zodResolver(quizGenerationRequestSchema),
    defaultValues: {
      subjectId: subjects[0]?.id ?? "",
      title: "",
      difficulty: "ensino_superior",
      questionCount: 8,
      questionTypes: ["multiple_choice", "true_false"],
    },
  });

  const selectedDifficulty = useWatch({
    control,
    name: "difficulty",
  }) as QuizDifficulty | undefined;
  const selectedQuestionTypes = useWatch({
    control,
    name: "questionTypes",
  }) as QuizGenerationFormValues["questionTypes"] | undefined;
  const attachedFile = useWatch({
    control,
    name: "pdf",
  });

  const generationMutation = useMutation<QuizGenerationResult, Error, QuizGenerationFormValues>({
    mutationFn: async (values: QuizGenerationFormValues): Promise<QuizGenerationResult> => {
      const formData = new FormData();
      formData.set("subjectId", values.subjectId);
      formData.set("title", values.title);
      formData.set("difficulty", values.difficulty);
      formData.set("questionCount", String(values.questionCount));
      values.questionTypes.forEach((questionType: string) => formData.append("questionTypes", questionType));
      formData.set("pdf", values.pdf);

      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok || !response.body) {
        const errorPayload = (await response.json().catch(() => ({ error: "Falha ao iniciar geração." }))) as {
          error?: string;
        };
        throw new Error(errorPayload.error ?? "Falha ao iniciar geração.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult: QuizGenerationResult | null = null;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const segments: string[] = buffer.split("\n\n");
        buffer = segments.pop() ?? "";

        for (const segment of segments) {
          const parsedEvent = parseSseEvent(segment);

          if (!parsedEvent) {
            continue;
          }

          if (parsedEvent.event === "progress") {
            setProgressEvents((current: GenerationProgressEvent[]) => [...current, parsedEvent.data]);
            continue;
          }

          if (parsedEvent.event === "error") {
            throw new Error(parsedEvent.data.message);
          }

          if (parsedEvent.event === "done") {
            finalResult = parsedEvent.data;
          }
        }
      }

      if (!finalResult) {
        throw new Error("A geração foi encerrada sem payload final.");
      }

      return finalResult;
    },
    onMutate: () => {
      setProgressEvents([]);
      toast.loading("Gerando quiz contextualizado...", { id: "quiz-generation" });
    },
    onError: (error: Error) => {
      toast.error(error.message, { id: "quiz-generation" });
    },
    onSuccess: (result: QuizGenerationResult) => {
      toast.success(result.fromCache ? "Quiz carregado do cache." : "Quiz gerado com sucesso.", {
        id: "quiz-generation",
      });
      router.push(`/quizzes/${result.quizId}`);
      router.refresh();
    },
  });

  const currentStatusLabel = useMemo<string>(() => {
    if (generationMutation.isPending) {
      return "Geração em andamento";
    }

    if (progressEvents.length === 0) {
      return "Pipeline pronto";
    }

    return progressEvents[progressEvents.length - 1]?.message ?? "Pipeline pronto";
  }, [generationMutation.isPending, progressEvents]);

  const onSubmit = handleSubmit((values: QuizGenerationFormValues) => generationMutation.mutate(values));

  return (
    <div className="grid gap-5 min-[1700px]:grid-cols-[minmax(0,1fr)_340px]">
      <form className="ui-panel min-w-0 space-y-6 px-5 py-5 sm:px-6 lg:px-7 lg:py-6" onSubmit={onSubmit}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.05fr)_220px]">
          <label>
            <span className="ui-label">Matéria</span>
            <select className="ui-select" {...register("subjectId")}>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="ui-label">Nível alvo</span>
            <select className="ui-select" {...register("difficulty")}>
              {quizDifficultyOptions.map((difficultyOption) => (
                <option key={difficultyOption.value} value={difficultyOption.value}>
                  {difficultyOption.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="ui-label">Questões</span>
            <input
              className="ui-input"
              min={3}
              max={20}
              type="number"
              {...register("questionCount", { valueAsNumber: true })}
            />
            {errors.questionCount ? <p className="mt-2 text-sm text-danger">{errors.questionCount.message}</p> : null}
          </label>
        </div>

        <div className="ui-card grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-center">
          <div>
            <p className="ui-label mb-0">Direção do quiz</p>
            <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-ink">
              {getQuizDifficultyLabel(selectedDifficulty)}
            </p>
            <p className="mt-2 text-sm leading-7 text-ink-soft">
              {getQuizDifficultyHint(selectedDifficulty)}
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-ink/10 bg-white/70 px-4 py-4">
            <p className="ui-label mb-0">Configuração ativa</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="ui-badge">{selectedQuestionTypes?.length ?? 0} tipos</span>
              <span className="ui-badge">{getQuizDifficultyLabel(selectedDifficulty)}</span>
            </div>
          </div>
        </div>

        <label>
          <span className="ui-label">Título do quiz</span>
          <input className="ui-input" placeholder="Ex.: Revisão de fisiologia cardiovascular" {...register("title")} />
          {errors.title ? <p className="mt-2 text-sm text-danger">{errors.title.message}</p> : null}
        </label>

        <fieldset>
          <legend className="ui-label">Tipos de questão</legend>
          <div className="grid gap-3 lg:grid-cols-3">
            {quizQuestionTypeValues.map((questionType) => (
              <label className="ui-card flex min-h-28 items-start gap-3 p-4" key={questionType}>
                <input
                  className="mt-1 h-4 w-4 rounded border border-ink/20 accent-accent"
                  type="checkbox"
                  value={questionType}
                  {...register("questionTypes")}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-[0.06em] text-ink">{getQuestionTypeLabel(questionType)}</p>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">
                    {questionType === "multiple_choice"
                      ? "Correção imediata e ideal para revisão rápida."
                      : questionType === "true_false"
                        ? "Bom para checagem conceitual objetiva."
                        : "Útil para síntese e resposta aberta."}
                  </p>
                </div>
              </label>
            ))}
          </div>
          {errors.questionTypes ? <p className="mt-2 text-sm text-danger">{errors.questionTypes.message as string}</p> : null}
        </fieldset>

        <div>
          <span className="ui-label">PDF de contexto</span>
          <label className="ui-panel-cut flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 px-6 py-8 text-center">
            <input
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setValue("pdf", file, { shouldValidate: true });
                  setCurrentFileName(file.name);
                }
              }}
              type="file"
            />
            <Upload className="h-6 w-6 text-accent" />
            <div>
              <p className="font-[var(--font-display)] text-[2rem] font-bold uppercase tracking-[-0.08em] text-ink sm:text-[2.3rem]">
                Contexto para geração
              </p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-ink-soft">
                Arraste um PDF ou clique para anexar o material que o agente vai ler.
              </p>
            </div>
            <span className="max-w-full break-all rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
              {attachedFile ? currentFileName : "Aguardando arquivo"}
            </span>
          </label>
          {errors.pdf ? <p className="mt-2 text-sm text-danger">{errors.pdf.message}</p> : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button className="ui-button-primary" disabled={generationMutation.isPending} type="submit">
            {generationMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generationMutation.isPending ? "Gerando" : "Gerar quiz"}
          </button>
          <p className="flex items-center text-sm text-ink-soft">{currentStatusLabel}</p>
        </div>
      </form>

      <aside className="ui-panel-cut ui-surface-noise min-w-0 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="ui-label mb-0">Pipeline</p>
            <h3 className="mt-2 font-[var(--font-display)] text-[2.2rem] font-bold uppercase tracking-[-0.08em] text-ink">
              Streaming
            </h3>
          </div>
          <CheckSquare className="h-5 w-5 text-accent" />
        </div>
        <div className="mt-6 space-y-3">
          {progressEvents.length ? (
            progressEvents.map((event: GenerationProgressEvent, index: number) => (
              <article className="ui-card p-4" key={`${event.step}-${index}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="ui-badge">{event.step}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">{index + 1}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{event.message}</p>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white/45 p-5 text-sm leading-7 text-ink-soft">
              O feed de progresso SSE aparece aqui enquanto LangChain processa o PDF, gera embeddings e monta o quiz.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-ink/10 bg-white/60 p-4 text-sm leading-7 text-ink-soft">
          Tipos selecionados: {(selectedQuestionTypes ?? []).map(getQuestionTypeLabel).join(", ")}.
        </div>
      </aside>
    </div>
  );
}
