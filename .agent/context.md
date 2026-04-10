# Contexto do Projeto

## Descrição
Monorepo inicial do `student-ai` para a fase 1, com aplicação web em Next.js 16 focada em autenticação, base de domínio educacional e preparação de deploy contínuo na Vercel.

## Stack / Tecnologias
- Bun 1.3.5 com workspaces
- Next.js 16.2.1 com App Router
- React 19
- TypeScript 5
- Jest para unitário e integração
- Playwright para E2E
- k6 para carga
- Auth.js / NextAuth v5 beta
- PostgreSQL no Neon
- Prisma ORM 7 com `prisma.config.ts`
- LangChain.js para geração de quizzes
- OpenAI embeddings + geração de questões
- Upstash Redis para rate limiting por IP
- Sentry para captura de erros em produção
- GitHub Actions
- Vercel

## Convenções e Padrões
- Monorepo com app principal em `apps/web`
- Estrutura em Clean Architecture: `domain`, `application`, `infrastructure`, `presentation`
- Paths TypeScript via `@/*`
- Tipagem explícita em variáveis, parâmetros e retornos quando relevante
- Sem alteração direta no banco; mudanças estruturais devem virar migration versionada

## Notas Importantes
- O workspace atual não está ligado a um diretório `.git` válido nesta máquina
- O projeto Vercel precisa usar `Root Directory = apps/web`
- O runtime Bun foi validado localmente no build da fase 1
- O runtime Bun continuou compatível após headers globais, proxy de segurança e novas rotas API
- O runtime Bun continuou compatível após a inclusão de LangChain.js, `pdf-parse` e SSE em `/api/quiz/generate`
- OAuth só deve ser exibido/ativado quando as chaves estiverem configuradas
- CORS é controlado por allowlist/patterns de origem via variáveis `SECURITY_CORS_ALLOWED_ORIGINS` e `SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS`
- Rate limiting só é ativado quando `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` estiverem configurados
- O identificador exato do modelo configurado para geração é `gpt-5.4-mini`

---

## Banco de Dados

### Banco
PostgreSQL (Neon)

### ORM / Query Builder
Prisma ORM 7

### Convenções de Migration
- Pasta: `apps/web/prisma/migrations`
- Nome inicial adotado: `YYYYMMDD_descricao_curta`
- SQL gerado a partir do schema Prisma; aplicação no banco somente por migration

### Estrutura Principal
- `users` guarda conta, imagem e `passwordHash`
- `subjects` cataloga matérias por `slug`
- `quizzes` pertence a `subjects`
- `quiz_questions` armazena perguntas geradas e seus metadados
- `source_documents` guarda o texto bruto do PDF ligado ao quiz e à matéria
- `document_chunks` armazena chunks e embeddings serializados
- `generated_quiz_cache` guarda payloads gerados e reutilizáveis por cache key
- `results` relaciona `users` e `quizzes`
- `question_attempts` guarda trilha analítica por questão com tempo, acerto/erro, dificuldade, tipo e subtópico

### Notas de Banco
- Prisma 7 removeu `datasource.url` do `schema.prisma`; a conexão do CLI fica em `apps/web/prisma.config.ts`
- O client Prisma usa driver adapter `@prisma/adapter-pg`
- A migration inicial foi gerada em arquivo, mas ainda não foi aplicada em um banco Neon real neste ambiente
- A fase do motor de quiz adicionou uma migration separada para documentos, chunks, perguntas e cache
- A fase de analytics adicionou `topic` em `quiz_questions`, tracking por questão em `question_attempts` e índice composto em `results(userId, completedAt)`

---

## Design

### Design System
Tailwind CSS v4 com tokens em `@theme`, utilitários semânticos e componentes base em `globals.css`

### Tipografia
- display: "Syne"
- corpo: Arial / Helvetica / sans-serif

### Paleta de Cores
- accent: `#a4491c`
- accent-deep: `#7b2f0f`
- accent-soft: `#f3d7ca`
- background: `#f4efe6`
- surface: `#fbf7f0`
- surface-muted: `#e7dfd2`
- text-primary: `#161411`
- text-secondary: `#655f57`
- success: `#275d4b`
- warning: `#946114`
- error: `#a62d22`

### Espaçamento e Grid
- Container máximo: `1760px`
- Escala dominante em múltiplos de `4px`
- Aside responsivo com navegação fixa no desktop e barra inferior no mobile

### Componentes Base
- CTAs `.ui-button-primary`, `.ui-button-secondary` e `.ui-button-ghost`
- Superfícies `.ui-panel`, `.ui-panel-cut`, `.ui-card`, `.ui-badge`
- Formulários com `React Hook Form` + `Zod`
- Catálogo filtrável, player de quiz com timer, upload com drag and drop e toasts globais
- Dashboard analítico com gráficos, recomendação automática e exportação de relatório em PDF por sessão

### Acessibilidade
- Meta mínima: contraste AA
- Foco e interação explícitos
- Cursores explícitos para links, botões, inputs e estados desabilitados
- Alvos interativos mínimos de `44px`

### Animações e Transições
- Interações com `200ms`
- Hover com deslocamento curto e feedback de superfície

### Breakpoints
- mobile-first com navegação inferior abaixo de `lg`
- layouts laterais amplos priorizados apenas em desktop realmente largo para evitar desperdício de largura em telas intermediárias

### Notas de Design
- Evitar visual genérico padrão de template
- Priorizar modo claro e contraste quente
- MVP visual fechado em 5 telas: Dashboard, Criar Quiz, Resolver Quiz, Histórico e Upload de Contexto
- Não usar valores visuais fora dos tokens já definidos sem registrar no histórico visual
- Segurança visual inclui não renderizar HTML arbitrário e manter CSP restritiva como primeira linha de defesa contra XSS
- Documentação operacional e rollout não devem introduzir telas visuais extras fora do MVP core

---

## Histórico Visual

### Tema Completo - TC - v1
**Data:** 2026-04-09
**Motivo:** Definição inicial da identidade visual da fase 1

```json
{
  "fonts": {
    "display": "Space Grotesk",
    "body": "IBM Plex Sans"
  },
  "colors": {
    "background": "#f5f1e8",
    "surface": "rgba(255, 252, 245, 0.88)",
    "surfaceStrong": "#fffaf0",
    "foreground": "#1f1a14",
    "muted": "#6f665a",
    "accent": "#0f766e",
    "accentStrong": "#115e59",
    "danger": "#b42318"
  },
  "layout": {
    "maxWidth": "1120px",
    "radiusPanel": "28px",
    "radiusCard": "22px"
  },
  "motion": {
    "duration": "160ms",
    "easing": "ease"
  }
}
```

### Componentes - K - v1
**Data:** 2026-04-09
**Motivo:** Primeira versão visual dos fluxos de home, login, cadastro e dashboard

```json
{
  "components": [
    "hero-card",
    "panel",
    "metric",
    "card",
    "button",
    "button-secondary",
    "button-danger"
  ]
}
```

### Tema Completo - TC - v2
**Data:** 2026-04-09
**Motivo:** Rebase visual da fase de frontend com Tailwind, foco mobile-first e identidade minimalista refinada

```json
{
  "fonts": {
    "display": "Syne",
    "body": "Arial"
  },
  "colors": {
    "background": "#f4efe6",
    "surface": "#fbf7f0",
    "surfaceMuted": "#e7dfd2",
    "foreground": "#161411",
    "muted": "#655f57",
    "accent": "#a4491c",
    "accentDeep": "#7b2f0f",
    "accentSoft": "#f3d7ca",
    "success": "#275d4b",
    "warning": "#946114",
    "danger": "#a62d22"
  },
  "layout": {
    "maxWidth": "1440px",
    "asideWidth": "280px",
    "radiusPanel": "1.75rem",
    "radiusCard": "1.25rem"
  },
  "motion": {
    "duration": "200ms",
    "hoverLift": "translateY(-2px)"
  }
}
```

### Componentes - K - v2
**Data:** 2026-04-09
**Motivo:** Segunda fase de UI com design system semântico e telas core do MVP

```json
{
  "components": [
    "app-chrome",
    "page-header",
    "metric-card",
    "quiz-catalog",
    "quiz-player",
    "quiz-generation-form",
    "context-upload-form",
    "history-list",
    "empty-state",
    "route-loading-shell",
    "toast-provider"
  ]
}
```

### Componentes - K - v3
**Data:** 2026-04-09
**Motivo:** Camada analítica da fase 3 com gráficos, histórico avançado e exportação

```json
{
  "components": [
    "performance-dashboard",
    "history-filters-form",
    "history-pagination",
    "export-session-button"
  ]
}
```

### Componentes - K - v4
**Data:** 2026-04-10
**Motivo:** Refinamento de legibilidade e responsividade nas telas de estudo e histórico

```json
{
  "components": [
    "reading-title",
    "option-card",
    "history-filter-panel",
    "compact-study-aside"
  ]
}
```

### Componentes - K - v5
**Data:** 2026-04-10
**Motivo:** Recalibragem do desktop e nova taxonomia de dificuldade orientada por nível acadêmico

```json
{
  "components": [
    "difficulty-level-chip",
    "quiz-direction-card",
    "wide-editorial-header",
    "wide-generation-grid"
  ]
}
```

---

## Histórico de Decisões

- [2026-04-09] Arquitetura — Estrutura inicial organizada como monorepo Bun com app principal em `apps/web`
- [2026-04-09] Runtime — Next.js 16 validado localmente com Bun para `lint`, `typecheck` e `build`
- [2026-04-09] Banco — Prisma 7 configurado com `prisma.config.ts` por incompatibilidade com `datasource.url` no schema
- [2026-04-09] Banco — Modelos iniciais definidos como `users`, `subjects`, `quizzes` e `results`
- [2026-04-09] Auth — Base de autenticação implementada com Auth.js v5 em JWT, credenciais e OAuth opcional
- [2026-04-09] CI/CD — Workflow do GitHub Actions criado para qualidade e preview deploy na Vercel
- [2026-04-09] Design — Identidade visual inicial definida com tokens CSS, `Space Grotesk` e `IBM Plex Sans`
- [2026-04-09] UX — Cursores explícitos adicionados para links, botões, campos de texto e estados desabilitados
- [2026-04-09] Segurança — Rotas API próprias passaram a usar camada compartilhada de validação Zod, sanitização e respostas CORS consistentes
- [2026-04-09] Segurança — `proxy.ts` passou a aplicar CORS restrito por origin e rate limiting por IP com Upstash Redis nas rotas `/api`
- [2026-04-09] Segurança — `next.config.ts` recebeu CSP, `X-Frame-Options`, HSTS, `nosniff`, `Referrer-Policy` e `Permissions-Policy`
- [2026-04-09] Segurança — Inputs de autenticação foram endurecidos com sanitização e validação allowlist para reduzir superfície de SQL injection e XSS
- [2026-04-09] Segurança — Testes unitários foram adicionados para todos os schemas Zod e utilitários críticos de segurança
- [2026-04-09] Dependências — Dependabot foi configurado e o CI recebeu job dedicado de `npm audit` para dependências de produção
- [2026-04-09] Banco — Motor de geração de quiz adicionou `quiz_questions`, `source_documents`, `document_chunks` e `generated_quiz_cache`
- [2026-04-09] IA — Pipeline de geração passou a usar LangChain.js para chunking, embeddings e orquestração de geração contextual
- [2026-04-09] IA — O modelo configurado para geração foi definido como `gpt-5.4-mini`, que é o identificador atual do GPT-5 mini na documentação da OpenAI
- [2026-04-09] API — A rota `/api/quiz/generate` foi criada com upload de PDF, autenticação obrigatória, validação Zod e resposta SSE
- [2026-04-09] Performance — Cache persistente por `cacheKey` foi adicionado para reutilizar quizzes gerados e reduzir custo de API
- [2026-04-09] Frontend — O design system foi refeito com Tailwind CSS v4, tokens em `@theme`, toasts globais e componentes semânticos reutilizáveis
- [2026-04-09] Design — A tipografia visual foi redefinida para `Syne` no display e Arial no corpo para respeitar o escopo solicitado com identidade própria
- [2026-04-09] UX — O MVP visual foi explicitamente limitado a 5 telas core para conter escopo: Dashboard, Criar Quiz, Resolver Quiz, Histórico e Upload de Contexto
- [2026-04-09] UX — A navegação principal passou a usar aside fixa no desktop e barra inferior no mobile para priorizar uso em estudo por dispositivo móvel
- [2026-04-09] Frontend — Estados de `loading`, `error` e `not-found` foram tratados visualmente para evitar telas cruas durante navegação App Router
- [2026-04-09] Banco — A camada analítica passou a registrar `question_attempts` por sessão com tempo, acerto/erro, tipo, dificuldade e subtópico
- [2026-04-09] IA — Questões geradas passaram a incluir `topic` para suportar diagnóstico por subtópico e recomendação focada
- [2026-04-09] API — Foram adicionadas rotas autenticadas de analytics para overview, histórico paginado e relatório por sessão
- [2026-04-09] Frontend — O dashboard recebeu gráficos em Recharts por período, matéria, dificuldade e tipo de questão
- [2026-04-09] Frontend — O histórico passou a suportar paginação, filtros avançados e exportação de relatório em PDF com jsPDF
- [2026-04-09] Performance — As queries analíticas ficaram filtradas por usuário e período, com índices dedicados; views materializadas ficam como próximo passo apenas se o volume real justificar
- [2026-04-09] Observabilidade — `@vercel/analytics` foi ligado ao layout para telemetria básica de navegação sem expandir o escopo visual
- [2026-04-10] Testes — A suíte final foi padronizada em Jest para unitário/integração e Playwright para E2E, substituindo a direção inicial de Vitest por alinhamento com o stack de testes do ecossistema Next.js
- [2026-04-10] Testes — O threshold global de cobertura foi fixado em 80% e validado localmente com foco em rotas críticas, validação, CORS, rate limit e flags operacionais
- [2026-04-10] Segurança — A rota `/api/quiz/[quizId]/submit` passou a validar `params` por schema, fechando uma falha que podia degradar erro de cliente para 500
- [2026-04-10] Observabilidade — Sentry foi integrado com `global-error`, instrumentation e reporting server-side, mas o upload de sourcemaps no build só é ativado quando as credenciais existem
- [2026-04-10] Documentação — A aplicação passou a expor `/api/openapi` com especificação OpenAPI 3.1 para consumo por Swagger Editor e clientes internos
- [2026-04-10] Operação — `robots.ts` foi adicionado para bloquear indexação fora de produção e liberar apenas o domínio canônico configurado
- [2026-04-10] CI/CD — O pipeline recebeu setup explícito de Node para Jest/Playwright e job E2E separado com Chromium em CI
- [2026-04-10] Rollout — O plano de rollback foi formalizado com feature flags, Preview Branches da Vercel e PITR do Neon como mecanismo de contenção
- [2026-04-10] DX — O `next.config.ts` passou a usar `allowedDevOrigins` para liberar acesso LAN ao dev server e evitar fallback de formulários para `GET` quando a hidratação é bloqueada
- [2026-04-10] Auth — Formulários de login e cadastro passaram a declarar `method="post"` explicitamente para impedir vazamento de credenciais na query string em cenários de fallback do navegador
- [2026-04-10] Auth — O `AUTH_SECRET` foi explicitado na configuração do Auth.js para reduzir ambiguidade de sessão em desenvolvimento; cookies antigos ainda exigem limpeza manual quando o segredo muda
- [2026-04-10] Design — A UI passou por um refinamento editorial de leitura: perguntas deixaram de usar heading em uppercase para priorizar legibilidade e ritmo de leitura no fluxo de estudo
- [2026-04-10] Responsividade — A sidebar principal foi mantida apenas em desktop largo (`2xl`) e o container do app foi expandido para `1760px` para melhorar aproveitamento horizontal sem comprimir o conteúdo
- [2026-04-10] UI — Cards de opção, filtros do histórico e upload de contexto receberam mais respiro, quebra de texto e hierarquia menos densa para evitar visual comprimido
- [2026-04-10] Domínio — A dificuldade dos quizzes deixou de usar apenas `easy/medium/hard` e passou a adotar níveis semânticos (`ensino_medio`, `ensino_superior`, `pos_graduacao`, `doutorado`, `concurso`) com normalização para legados
- [2026-04-10] UX — A tela de criação de quiz passou a exibir o nível alvo como direção editorial do formulário, com hints pedagógicos e grade mais larga antes de abrir coluna lateral de pipeline
- [2026-04-10] Frontend — O layout raiz passou a declarar `data-scroll-behavior="smooth"` no `<html>` para alinhar `scroll-behavior: smooth` com a expectativa do App Router do Next.js
- [2026-04-10] Frontend — O dashboard analítico passou a montar gráficos apenas após o container reportar dimensões válidas, eliminando warnings de `ResponsiveContainer` com largura/altura negativas no navegador
