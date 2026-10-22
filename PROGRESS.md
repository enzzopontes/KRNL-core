# KRNL Core — Progresso do Desenvolvimento

## Status: RODADA 2 CONCLUÍDA

### Fases Concluídas e Refinadas
- [x] **Fase 1 — Fundação**: Expo 57, HUD Design Tokens, Skia Gauges, anel com fórmula aberta, acessibilidade e suporte i18n PT-BR/EN.
- [x] **Fase 2 — Armazenamento**: Módulo Kotlin `KrnlStorageModule`, Treemap de disco em Skia, scanner de lixo com modo simulação (dry-run) e quarentena via `renameTo`.
- [x] **Fase 3 — Duplicadas**: Algoritmo nativo 3-stage com xxHash64 (início/meio/fim e completo), dHash perceptual 64-bit para fotos, aviso para Android 14+ de fotos parciais.
- [x] **Fase 4 — Apps e Segurança**: Gerenciador de Apps com `UsageStats`, inatividade 30/60/90 dias, debloater seguro com listas curadas no Supabase e trava rígida de kernel/SystemUI.
- [x] **Fase 5 — Automação e Avançado**: WorkManager periódico com restrição a carregamento + Wi-Fi. Desacoplamento físico do código Shizuku entre `src/direct` e `src/play`.
- [x] **Fase 6 — Conta e Cobrança**: Supabase RLS restritivo (`licenses` com SELECT exclusivo pelo dono), validação HMAC `x-signature` e verificação na API do Mercado Pago no webhook.

### Validações da Rodada 2
- [x] Compilação do Android App Bundle (`bundleRelease`) gerado com sucesso com R8 / Proguard ativado (106.5 MB contendo as 4 arquiteturas completas).
- [x] Decomposição do AAB: cada ABI individual comprimida para download possui ~10 a 12 MB (atendendo à meta de < 25 MB por dispositivo).
- [x] 100% de passagem nos testes unitários Jest (9/9 testes passando).
- [x] Varredura de segurança contra vazamento de segredos no histórico Git.
- [x] TODO_HUMANO.md detalhado com políticas da Play Store (QUERY_ALL_PACKAGES, Data Safety, faturamento alternativo).
