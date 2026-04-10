import Link from "next/link";
import { quizDifficultyOptions } from "@/domain/value-objects/quiz-difficulty";

type HistoryFiltersFormProps = {
  subjects: Array<{
    id: string;
    name: string;
  }>;
  values: {
    period: string;
    subjectId?: string;
    difficulty?: string;
    questionType?: string;
    from?: string;
    to?: string;
  };
};

export function HistoryFiltersForm({ subjects, values }: HistoryFiltersFormProps) {
  return (
    <form className="ui-panel space-y-5 px-5 py-5 sm:px-6 lg:px-7 lg:py-6" method="GET">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="ui-label mb-0">Filtros de revisão</p>
          <p className="mt-3 ui-reading-copy">
            Refine o histórico por matéria, dificuldade, tipo de questão e período para localizar sessões com mais atrito.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="ui-button-primary" type="submit">
            Aplicar filtros
          </button>
          <Link className="ui-button-secondary" href="/history">
            Limpar
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <label>
          <span className="ui-label">Período</span>
          <select className="ui-select" defaultValue={values.period} name="period">
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
            <option value="365d">365 dias</option>
            <option value="all">Tudo</option>
          </select>
        </label>

        <label>
          <span className="ui-label">Matéria</span>
          <select className="ui-select" defaultValue={values.subjectId ?? ""} name="subjectId">
            <option value="">Todas</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="ui-label">Dificuldade</span>
          <select className="ui-select" defaultValue={values.difficulty ?? ""} name="difficulty">
            <option value="">Todas</option>
            {quizDifficultyOptions.map((difficultyOption) => (
              <option key={difficultyOption.value} value={difficultyOption.value}>
                {difficultyOption.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="ui-label">Tipo</span>
          <select className="ui-select" defaultValue={values.questionType ?? ""} name="questionType">
            <option value="">Todos</option>
            <option value="multiple_choice">Multiple choice</option>
            <option value="true_false">True / false</option>
            <option value="essay">Essay</option>
          </select>
        </label>

        <label>
          <span className="ui-label">De</span>
          <input className="ui-input" defaultValue={values.from ?? ""} name="from" type="date" />
        </label>

        <label>
          <span className="ui-label">Até</span>
          <input className="ui-input" defaultValue={values.to ?? ""} name="to" type="date" />
        </label>
      </div>
    </form>
  );
}
