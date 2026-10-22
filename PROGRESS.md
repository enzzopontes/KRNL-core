# KRNL Core — Progresso do Desenvolvimento

## Status do Projeto: AUDITORIA E FECHAMENTO CONCLUÍDOS

Todas as fases (1 a 6) foram implementadas, auditadas e verificadas com builds nativos e testes unitários.

### Fases Concluídas
- [x] **Fase 1 — Fundação**: Expo 57, Design System HUD (tokens MMKV + Zustand), Skia Gauges, anel de saúde com fórmula visível, navegação Expo Router e onboarding de permissões transparente.
- [x] **Fase 2 — Armazenamento**: Módulo Kotlin `KrnlStorageModule`, Treemap de disco em Skia, scanner com modo simulação (dry-run) obrigatório e lixeira interna com quarentena via `renameTo`.
- [x] **Fase 3 — Duplicadas**: Módulo Kotlin `KrnlDuplicatesModule`, 3-stage hash (tamanho -> parcial 16KB início/meio/fim -> completo), dHash perceptual 64-bit para fotos semelhantes e comparação lado a lado.
- [x] **Fase 4 — Apps e Segurança**: Módulo Kotlin `KrnlAppsModule`, listagem com UsageStats, identificação de inatividade (30+ dias), debloater seguro com fluxo do sistema e pacotes de kernel travados no código.
- [x] **Fase 5 — Automação e Avançado**: Módulo Kotlin `KrnlAdvancedModule` com WorkManager semanal restrito a carregamento + Wi-Fi. Shizuku isolado exclusivamente no flavor `direct`.
- [x] **Fase 6 — Conta e Cobrança**: Schema SQL no Supabase com Row Level Security (RLS) aplicado no banco remoto, Edge Functions de checkout Mercado Pago e webhook idempotente, tela de assinatura side-by-side com Google Play Billing.

### Auditoria e Validações
- [x] Build Android `play` (com.krnl.core) compilado em debug com sucesso via Gradle.
- [x] Build Android `direct` (com.krnl.core.direct) compilado em debug com sucesso via Gradle.
- [x] 100% de passagem nos testes unitários Jest (fórmula de saúde, duplicadas, lixeira, cache de licença, idempotência).
- [x] Sincronização remota via Git com o repositório `enzzopontes/KRNL-core`.
