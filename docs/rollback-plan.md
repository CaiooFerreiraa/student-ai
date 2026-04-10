# Plano de rollback

## Estratégia

- Deploy incremental por Preview Branches da Vercel
- Ativação e desativação rápida por feature flags
- Banco preservado por backup/PITR do Neon

## Ordem de rollback

1. Desligar a feature problemática via variável de ambiente:
   - `FEATURE_QUIZ_GENERATION`
   - `FEATURE_ANALYTICS_API`
   - `FEATURE_ANALYTICS_DASHBOARD`
   - `FEATURE_EXPORT_REPORTS`
   - `FEATURE_API_DOCS`
   - `FEATURE_SENTRY`
2. Promover a Preview Branch estável anterior ou redeploy do commit anterior na Vercel.
3. Se o problema envolver schema, restaurar o Neon via PITR ou aplicar SQL reverso validado.
4. Reabrir o tráfego só depois de validar auth, geração e analytics.

## Critérios de rollback imediato

- Regressão de login ou perda de sessão
- Timeouts contínuos em `/api/quiz/generate`
- Queries de analytics degradando o banco principal
- Aumento de 5xx nos Vercel Logs ou explosão de erros no Sentry

## Operação segura

- Nunca promover mudanças de schema e feature visual crítica ao mesmo tempo sem preview validado.
- Preferir rollout por flags: subir código com feature desligada, validar e então abrir gradualmente.
