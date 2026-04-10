import Link from "next/link";
import { redirect } from "next/navigation";
import { FileSearch, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { listSubjects } from "@/application/use-cases/list-subjects";
import { AppChrome } from "@/presentation/components/app-chrome";
import { ContextUploadForm } from "@/presentation/components/context-upload-form";
import { EmptyState } from "@/presentation/components/empty-state";
import { PageHeader } from "@/presentation/components/page-header";

export default async function ContextPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const subjects = await listSubjects();

  return (
    <AppChrome>
      <div className="space-y-5 pb-24 lg:pb-4">
        <PageHeader
          eyebrow="Upload de contexto"
          title="Inspecione o PDF antes de gerar."
          description="Faça upload com drag and drop, confirme a extração e valide os primeiros chunks para reduzir custo e ruído na geração."
          actions={
            <Link className="ui-button-primary" href="/quizzes/new">
              <Sparkles className="h-4 w-4" />
              Ir para geração
            </Link>
          }
        />

        {subjects.length ? (
          <ContextUploadForm
            subjects={subjects.map((subject) => ({
              id: subject.id,
              name: subject.name,
            }))}
          />
        ) : (
          <EmptyState
            actionHref="/dashboard"
            actionLabel="Voltar ao painel"
            description="Cadastre pelo menos uma matéria para associar o documento ao contexto correto antes de extrair o preview."
            icon={FileSearch}
            title="Matérias ausentes"
          />
        )}
      </div>
    </AppChrome>
  );
}
