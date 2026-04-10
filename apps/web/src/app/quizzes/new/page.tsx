import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Layers3 } from "lucide-react";
import { auth } from "@/auth";
import { listSubjects } from "@/application/use-cases/list-subjects";
import { AppChrome } from "@/presentation/components/app-chrome";
import { EmptyState } from "@/presentation/components/empty-state";
import { PageHeader } from "@/presentation/components/page-header";
import { QuizGenerationForm } from "@/presentation/components/quiz-generation-form";

export default async function NewQuizPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const subjects = await listSubjects();

  return (
    <AppChrome>
      <div className="space-y-5 pb-24 lg:pb-4">
        <PageHeader
          eyebrow="Criar quiz"
          title="Geração contextual com PDF e streaming."
          description="Selecione matéria, dificuldade e tipos de questão. O pipeline responde em tempo real enquanto processa o material e cria o quiz."
          actions={
            <Link className="ui-button-secondary" href="/context">
              <FileText className="h-4 w-4" />
              Validar contexto
            </Link>
          }
        />

        {subjects.length ? (
          <QuizGenerationForm
            subjects={subjects.map((subject) => ({
              id: subject.id,
              name: subject.name,
            }))}
          />
        ) : (
          <EmptyState
            actionHref="/dashboard"
            actionLabel="Voltar ao painel"
            description="Não existe nenhuma matéria cadastrada. O fluxo de geração precisa de ao menos uma matéria para classificar o quiz."
            icon={Layers3}
            title="Matérias não encontradas"
          />
        )}
      </div>
    </AppChrome>
  );
}
