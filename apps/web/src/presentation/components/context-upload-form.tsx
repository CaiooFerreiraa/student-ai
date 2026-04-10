"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FileText, LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  contextPreviewRequestSchema,
  type ContextPreviewRequest,
} from "@/application/validators/quiz-generation-schemas";

type ContextUploadFormProps = {
  subjects: Array<{
    id: string;
    name: string;
  }>;
};

type PreviewResponse = {
  subject: {
    id: string;
    name: string;
  };
  preview: {
    fileName: string;
    checksum: string;
    characterCount: number;
    chunkCount: number;
    excerpt: string;
    firstChunks: Array<{
      sequence: number;
      content: string;
      tokenEstimate: number;
    }>;
  };
};

type FormValues = ContextPreviewRequest;

export function ContextUploadForm({ subjects }: ContextUploadFormProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(contextPreviewRequestSchema),
    defaultValues: {
      subjectId: subjects[0]?.id ?? "",
    },
  });

  const currentFile: File | undefined = useWatch({
    control,
    name: "pdf",
  });

  const previewMutation = useMutation<PreviewResponse, Error, FormValues>({
    mutationFn: async (values: FormValues): Promise<PreviewResponse> => {
      const formData = new FormData();
      formData.set("subjectId", values.subjectId);
      formData.set("pdf", values.pdf);

      const response = await fetch("/api/context/preview", {
        method: "POST",
        body: formData,
      });

      const json = (await response.json()) as PreviewResponse | { error: string };

      if (!response.ok || "error" in json) {
        throw new Error("error" in json ? json.error : "Falha ao extrair contexto.");
      }

      return json;
    },
    onMutate: () => toast.loading("Extraindo contexto do PDF...", { id: "context-preview" }),
    onSuccess: () => toast.success("Preview pronto.", { id: "context-preview" }),
    onError: (error: Error) => toast.error(error.message, { id: "context-preview" }),
  });

  const currentFileLabel = useMemo<string>(() => {
    if (!currentFile) {
      return "Nenhum PDF selecionado";
    }

    return `${currentFile.name} · ${(currentFile.size / 1024 / 1024).toFixed(2)} MB`;
  }, [currentFile]);

  const onSubmit = handleSubmit((values: FormValues) => previewMutation.mutate(values));

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <form className="ui-panel space-y-5 px-5 py-5 sm:px-6" onSubmit={onSubmit}>
        <div>
          <label className="ui-label" htmlFor="subjectId">
            Matéria
          </label>
          <select className="ui-select" id="subjectId" {...register("subjectId")}>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId ? <p className="mt-2 text-sm text-danger">{errors.subjectId.message}</p> : null}
        </div>

        <div>
          <span className="ui-label">PDF</span>
          <label
            className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[1.7rem] border border-dashed px-6 py-8 text-center transition duration-200 ${
              dragActive ? "border-accent bg-accent-soft/35" : "border-ink/15 bg-white/55 hover:bg-white/80"
            }`}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              const droppedFile: File | undefined = event.dataTransfer.files[0];
              if (droppedFile) {
                setValue("pdf", droppedFile, { shouldValidate: true });
              }
            }}
          >
            <input
              className="hidden"
              onChange={(event) => {
                const selectedFile: File | undefined = event.target.files?.[0];
                if (selectedFile) {
                  setValue("pdf", selectedFile, { shouldValidate: true });
                }
              }}
              type="file"
            />
            <Upload className="h-6 w-6 text-accent" />
            <p className="mt-4 font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.08em] text-ink">
              Solte o PDF aqui
            </p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-ink-soft">
              Pré-visualize o texto extraído e os primeiros chunks antes de disparar geração de quiz.
            </p>
            <p className="mt-5 rounded-full border border-ink/10 bg-paper px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
              {currentFileLabel}
            </p>
          </label>
          {errors.pdf ? <p className="mt-2 text-sm text-danger">{errors.pdf.message}</p> : null}
        </div>

        <button className="ui-button-primary w-full sm:w-auto" disabled={previewMutation.isPending} type="submit">
          {previewMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {previewMutation.isPending ? "Extraindo" : "Gerar preview"}
        </button>
      </form>

      <section className="ui-panel px-5 py-5 sm:px-6">
        <p className="ui-label">Preview de extração</p>
        {previewMutation.data ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="ui-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Arquivo</p>
                <p className="mt-2 text-sm font-semibold text-ink">{previewMutation.data.preview.fileName}</p>
              </div>
              <div className="ui-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Caracteres</p>
                <p className="mt-2 text-sm font-semibold text-ink">{previewMutation.data.preview.characterCount}</p>
              </div>
              <div className="ui-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Chunks</p>
                <p className="mt-2 text-sm font-semibold text-ink">{previewMutation.data.preview.chunkCount}</p>
              </div>
            </div>

            <div className="ui-card p-5">
              <p className="ui-label">Trecho inicial</p>
              <p className="text-sm leading-7 text-ink-soft">{previewMutation.data.preview.excerpt}</p>
            </div>

            <div className="space-y-3">
              {previewMutation.data.preview.firstChunks.map((chunk) => (
                <article className="ui-card p-4" key={chunk.sequence}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="ui-badge">Chunk {chunk.sequence + 1}</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                      {chunk.tokenEstimate} tokens aprox.
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-ink-soft">{chunk.content}</p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-[1.7rem] border border-dashed border-ink/15 bg-white/45 p-6 text-center text-sm leading-7 text-ink-soft">
            Envie um PDF para inspecionar o texto extraído antes da geração do quiz.
          </div>
        )}
      </section>
    </div>
  );
}
