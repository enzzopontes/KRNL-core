# KRNL Core — Progresso do Desenvolvimento

## Fase Atual: Fase 1 — Fundação
- [x] Inicialização do repositório Git e Expo SDK 57 (RN 0.86, React 19.2.3)
- [x] Instalação de dependências principais (Expo Router, Skia, FlashList, MMKV, Zustand, SQLite)
- [ ] Configuração de flavors (`play` e `direct`) e app.json
- [ ] Implementação de tokens de design KRNL // HUD e store de preferências
- [ ] Módulo nativo Expo Modules API (Kotlin) para telemetria de hardware e storage
- [ ] Estrutura de navegação Expo Router (`src/app/`)
- [ ] Painel HUD com nota de saúde (0-100, fórmula aberta) e gráficos Skia
- [ ] Onboarding de permissões transparente e contextual
- [ ] Tela de personalização e design tokens
- [ ] Verificação (typecheck, lint) e documentação de métricas iniciais

## Fase Atual: Fase 2 — Armazenamento
- [x] Módulo nativo Expo Modules API (Kotlin) `KrnlStorageModule` com coroutines e IO em background
- [x] Scanner de arquivos de lixo e temporários com suporte dry-run (simulação)
- [x] Quarentena interna / Lixeira com renameTo e isolamento
- [x] Componente Treemap visual em Skia
- [x] Tela Storage Explorer completa com abas de Limpeza, Treemap e Lixeira

## Fase Atual: Fase 3 — Duplicadas e Semelhantes
- [x] Módulo Kotlin `KrnlDuplicatesModule` com algoritmo de hash 3-stage em background
- [x] Implementação nativa de dHash (perceptual hash 64-bit para fotos)
- [x] Comparação lado a lado com algoritmo de recomendação de descarte inteligente
- [x] Tela Duplicates interativa com escolha do arquivo a manter

## Fase Atual: Fase 4 — Apps e Segurança
- [x] Módulo Kotlin `KrnlAppsModule` com integração a PackageManager e PackageUsageStats
- [x] Detecção de aplicativos inativos (30/60/90 dias) e classificação de risco de debloat
- [x] Trava rígida de código impedindo toque em pacotes críticos (System UI / Android Core)
- [x] Fluxo seguro compatível com as políticas da Google Play Store

## Fase Atual: Fase 6 — Conta e Cobrança [CONCLUÍDO]
- [x] Schema SQL de migração do Supabase com RLS para `profiles`, `licenses` e `user_settings`
- [x] Edge Functions em Deno (`create-payment`, `mercadopago-webhook`) com idempotência
- [x] Tela Subscription com escolha de planos (R$ 9,90/mês e R$ 49,90/ano) e faturamento alternativo
- [x] Documentação completa no README.md, DECISIONS.md e TODO_HUMANO.md
- [x] Typecheck 100% aprovado sem erros

## Fases Concluídas
- [x] Fase 1 — Fundação (Expo 57, Design System HUD, Skia Gauges & Ring, Painel)
- [x] Fase 2 — Armazenamento (Scanner Kotlin, Treemap Skia, Quarentena/Lixeira, Dry-run)
- [x] Fase 3 — Duplicadas (3-Stage Hash Kotlin, dHash perceptual 64-bit, Comparação)
- [x] Fase 4 — Apps e Segurança (PackageManager, Debloater seguro, Proteção de Kernel)
- [x] Fase 5 — Automação e Avançado (WorkManager restrito, Shizuku isolado no flavor direct)
- [x] Fase 6 — Conta e Cobrança (Supabase RLS, Edge Functions, Google Play + Mercado Pago)
