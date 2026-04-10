# student-ai

`student-ai` é um monorepo Bun com aplicação web em Next.js 16, App Router, Auth.js v5, Prisma 7, Neon, LangChain e foco em estudo guiado por quiz.

## Stack

- Next.js 16 + React 19
- Bun 1.3 para workspace e fluxo local
- Prisma 7 + Neon PostgreSQL
- Auth.js v5 com credenciais e OAuth opcional
- LangChain.js + OpenAI para geração contextual
- Upstash Redis para rate limiting
- Jest para unitário/integração
- Playwright para E2E
- k6 para carga
- Sentry + Vercel Analytics para observabilidade

## Estrutura

```text
.
├─ apps/
│  └─ web/
│     ├─ prisma/
│     ├─ src/
│     │  ├─ app/
│     │  ├─ application/
│     │  ├─ domain/
│     │  ├─ infrastructure/
│     │  └─ presentation/
│     ├─ tests/
│     │  ├─ e2e/
│     │  └─ k6/
│     ├─ auth.ts
│     ├─ next.config.ts
│     ├─ playwright.config.ts
│     ├─ proxy.ts
│     └─ vercel.json
├─ docs/
└─ .github/workflows/
```

## Setup local

1. Instale dependências.
2. Copie `apps/web/.env.example` para `apps/web/.env`.
3. Preencha pelo menos `DATABASE_URL`, `AUTH_SECRET` e `AUTH_URL`.
4. Gere o client Prisma.
5. Suba a aplicação.

```bash
bun install
bun run prisma:generate
bun run dev
```

## Comandos

```bash
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run test:load
bun run build
```

## Testes

- `bun run test`: Jest com cobertura de unitário e integração. O threshold global está em 80%.
- `bun run test:e2e`: Playwright cobrindo auth, geração de quiz e analytics com `E2E_TEST_MODE=true`.
- `bun run test:load`: k6 contra `/api/health` para validar 200/429 e `Retry-After`.

Para o k6 local:

```bash
$env:LOCAL_RATE_LIMIT_MODE="true"
bun run dev
k6 run apps/web/tests/k6/rate-limit.js
```

## API docs

- OpenAPI JSON: `/api/openapi`
- Healthcheck: `/api/health`

O documento OpenAPI pode ser importado no Swagger Editor ou em qualquer viewer compatível com OpenAPI 3.1.

## Produção

- `Root Directory` da Vercel: `apps/web`
- Runtime de app: Node.js na Vercel, sem impacto na arquitetura Bun local
- Logs: Vercel Runtime Logs
- Erros: Sentry com `SENTRY_DSN` e `NEXT_PUBLIC_SENTRY_DSN`
- SEO/indexação: `robots.ts` bloqueia preview/dev e libera só produção

## Segurança e rollback

- Revisão final: [docs/security-review.md](docs/security-review.md)
- Checklist de deploy: [docs/deploy-checklist.md](docs/deploy-checklist.md)
- Plano de rollback: [docs/rollback-plan.md](docs/rollback-plan.md)
