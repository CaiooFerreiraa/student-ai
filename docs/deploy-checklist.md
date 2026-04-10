# Checklist de deploy

## Vercel

- Projeto apontando para `apps/web`
- `AUTH_SECRET` configurado com 32+ caracteres
- `AUTH_URL` configurado com a URL canônica
- `DATABASE_URL` apontando para o branch de produção do Neon
- `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` preenchidos
- `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` e `SENTRY_AUTH_TOKEN` preenchidos se Sentry estiver ativo
- Feature flags definidas para o rollout desejado
- `CUSTOM_DOMAIN` configurado

## Domínio e HTTPS

- Domínio customizado conectado na Vercel
- Redirect HTTP -> HTTPS validado
- HSTS ativo em produção
- `robots.txt` permitindo indexação apenas em produção

## Observabilidade

- Vercel Logs ativos no projeto
- Sentry recebendo um erro de teste controlado
- Vercel Analytics visível após primeiro tráfego

## Banco e migrations

- Confirmar schema do Neon consistente com o Prisma atual
- Executar backup ou point-in-time restore antes de migrations críticas
- Revisar índices antes do launch de analytics pesado

## Verificação final

- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run build`
- `bun run test:e2e`
