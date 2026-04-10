# Revisão final de segurança

## Superfície auditada

- Rotas API com `createApiRoute`
- `proxy.ts` para CORS, rate limiting e proteção de páginas autenticadas
- Auth.js v5 com JWT
- `next.config.ts` com CSP, HSTS e headers defensivos
- Sanitização de inputs e escape de outputs
- Flags operacionais para desligar features críticas sem redeploy de código

## Estado atual

- Todas as rotas próprias passam por validação Zod antes do caso de uso.
- CORS é restrito por allowlist exata e pattern de preview Vercel.
- Rate limit cobre `/api` e usa bucket mais agressivo para `/api/auth`.
- Inputs são sanitizados antes da validação e não há uso de SQL raw fora do Prisma.
- CSP bloqueia `frame-ancestors`, `object-src` e força `upgrade-insecure-requests` fora de desenvolvimento.
- Páginas protegidas são barradas no `proxy` antes de renderização.
- Exceções de servidor podem ser reportadas ao Sentry quando habilitado.

## Pontos de atenção aceitos

- `/api/auth/[...nextauth]` continua dependente da superfície de validação da biblioteca, não do wrapper Zod da aplicação.
- Streaming SSE de geração depende de timeout operacional da Vercel; o limite da rota foi fixado em 60s e o mock E2E evita acoplamento com LLM em CI.
- Prisma migrations no Neon foram alinhadas manualmente em parte do histórico; antes de um launch real convém baselinar o histórico do Prisma.

## Recomendação de go-live

- Prosseguir com produção somente com `AUTH_SECRET`, `DATABASE_URL`, Upstash e Sentry preenchidos.
- Manter `FEATURE_API_DOCS=true` apenas se a exposição da especificação for desejada no ambiente público.
- Reexecutar `npm audit --omit=dev` e revisar Dependabot alerts antes do corte final.
