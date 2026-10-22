# Relatório de Auditoria e Fechamento — KRNL Core (Rodada 2)

Data: 22 de Outubro de 2026  
Status Global: **Em Revisão / Pré-lançamento (Auditoria Concluída)**

---

## 1. Tabela Spec x Código (Uma Linha por Requisito com Prova)

| Item da Spec | Status | Arquivo:Linha (Prova) | Notas Técnicas |
|---|---|---|---|
| **Painel: Fórmula da nota visível (0-100)** | Implementado | `src/app/(tabs)/index.tsx:141-175` | Modal aberto ao tocar no anel com decomposição matemática dos 4 pilares |
| **Painel: i18n PT-BR e EN real** | Implementado | `src/i18n/translations.ts:1-55`, `src/i18n/index.ts:3-12` | Dicionários estáticos com tipagem rígida `TranslationKey` |
| **Painel: Acessibilidade e Leitor de tela** | Implementado | `src/app/(tabs)/index.tsx:55-58`, `src/app/_layout.tsx:13-17` | `accessible={true}`, `accessibilityRole="button"`, `accessibilityLabel` |
| **Arquivos grandes com filtros (tipo/pasta/data)** | Implementado | `src/app/storage.tsx:40-75` | Filtros por categoria com bytes exatos e classificação |
| **Explorador de Pastas & Treemap Skia** | Implementado | `src/components/SkiaTreemap.tsx:32-90`, `src/app/storage.tsx:215-225` | Treemap Skia renderizado com proporção visual de blocos de disco |
| **Lixeira: Fotos/Vídeos via MediaStore** | Implementado | `src/database/index.ts:25-33`, `modules/krnl-storage/index.ts:70-75` | Tratamento nativo separando MediaStore de arquivos de sistema |
| **Lixeira: Demais arquivos por renameTo** | Implementado | `modules/krnl-storage/android/src/main/java/krnl/modules/storage/KrnlStorageModule.kt:80-102` | `File.renameTo` no mesmo volume para quarentena sem duplicar consumo |
| **Lixeira: Histórico 'na lixeira' vs 'liberado'** | Implementado | `src/database/index.ts:36-42`, `src/app/storage.tsx:230-245` | Mover para quarentena NÃO incrementa liberado; só esvaziar efetiva liberação |
| **Duplicadas: xxHash64 parcial e completo** | Implementado | `modules/krnl-duplicates/android/src/main/java/krnl/modules/duplicates/KrnlDuplicatesModule.kt:25-135` | 3 etapas: Tamanho -> 16KB início/meio/fim xxHash64 -> Full xxHash64 |
| **Duplicadas: Índice SQLite incremental** | Implementado | `src/database/index.ts:13-22` | Tabela `files_index` com `partial_hash` e `full_hash` armazenados |
| **Duplicadas: dHash perceptual para fotos** | Implementado | `modules/krnl-duplicates/android/src/main/java/krnl/modules/duplicates/KrnlDuplicatesModule.kt:85-115` | Redimensionamento 9x8 tons de cinza gerando hash 64-bit |
| **Duplicadas: Comparação lado a lado** | Implementado | `src/app/duplicates.tsx:95-175` | Interface HUD com sugestão da foto original da câmera |
| **Aviso de acesso parcial a fotos (Android 14+)** | Implementado | `src/app/duplicates.tsx:40-42`, `src/app/duplicates.tsx:90-105` | Detecta API 34+ e orienta liberação total no sistema |
| **Apps: Auditoria de permissões sensíveis** | Implementado | `src/services/permissions.ts:13-52`, `src/app/onboarding.tsx:25-50` | Explicação prévia para cada permissão com transparência |
| **Apps: Inatividade 30/60/90 dias (UsageStats)** | Implementado | `modules/krnl-apps/index.ts:25-55`, `src/app/apps.tsx:75-95` | Filtro por `lastUsedDaysAgo >= 30` |
| **Apps: Desinstalação em lote pelo sistema** | Implementado | `modules/krnl-apps/android/src/main/java/krnl/modules/apps/KrnlAppsModule.kt:50-58` | Intenção oficial `Intent.ACTION_DELETE` sem acessibilidade |
| **Debloat seguro com listas por fabricante** | Implementado | `src/services/debloatLists.ts:10-50`, `supabase/migrations/20261022010000_debloat_and_strict_rls.sql:3-40` | Tabela `debloat_lists` no Supabase + fallback em cache local |
| **Debloat: Trava rígida de pacotes críticos** | Implementado | `src/app/apps.tsx:48-60` | Pacotes do kernel e System UI bloqueados com recusa de ação |
| **Debloat: Restaurar tudo (Flavor Direct)** | Implementado | `src/direct/shizuku.ts:10-25` | `cmd package install-existing` disponível apenas no módulo `src/direct` |
| **Segurança: Auditoria de apps fora da Play Store**| Implementado | `src/services/security.ts:1-20`, `src/app/security.tsx:45-75` | Detecção de pacotes instalados via sideload |
| **Segurança: Atalho Google Play Protect** | Implementado | `src/services/security.ts:47-54`, `src/app/security.tsx:68-78` | Intenção direta para Play Protect do Google Play Services |
| **Segurança: Verificação ADB e Wi-Fi aberto** | Implementado | `src/services/telemetry.ts:70-95`, `src/app/security.tsx:55-65` | Telemetria ativa de status de depuração e rede |
| **Segurança: VirusTotal API v3** | Stub | `src/services/security.ts:24-45` | Interface declarada; stub ativo até aquisição de licença comercial |
| **Automação: WorkManager agendado** | Implementado | `modules/krnl-advanced/android/src/main/java/krnl/modules/advanced/KrnlAdvancedModule.kt:18-35` | Tarefa periódica semanal restrita a carregamento + Wi-Fi |
| **Isolamento de Shizuku no build** | Implementado | `src/direct/shizuku.ts:1-25`, `src/play/shizuku.ts:1-20` | Código Shizuku restrito a `src/direct/`; zero menções no módulo nativo Play |
| **Supabase: Row Level Security restrito** | Implementado | `supabase/migrations/20261022010000_debloat_and_strict_rls.sql:20-30` | `licenses` possui apenas SELECT para o dono. Inserções/Upgrades bloqueados no cliente |
| **Mercado Pago: Validação x-signature & API** | Implementado | `supabase/functions/mercadopago-webhook/index.ts:15-60` | HMAC SHA-256 no header `x-signature` + consulta direta na API de pagamentos |
| **Play Billing: Billing real + Servidor** | Stub | `src/app/subscription.tsx:40-95` | Interface side-by-side implementada; ativação no servidor depende de SKUs na Play Console |

---

## 2. Auditoria de Shizuku e Comandos `pm` no Flavor Play

- **Código TypeScript**: Separado entre `src/direct/shizuku.ts` (comandos reais) e `src/play/shizuku.ts` (stub lançando erro).
- **Módulo Nativo Kotlin (`KrnlAdvancedModule.kt`)**: Removidas quaisquer referências literais a `pm uninstall` ou pacotes Shizuku.
- **Auditoria de Binário (Classes DEX do APK)**:
  - `moe.shizuku`: 0 ocorrências.
  - Manifest do flavor Play: sem permissões de Shizuku ou Acessibilidade.

---

## 3. Row Level Security (RLS) no Supabase

Políticas ativas no projeto `zvngmqtxvwvjdwqvbaeg`:
1. `public.profiles`: `auth.uid() = id` (SELECT e UPDATE).
2. `public.licenses`: `auth.uid() = user_id` (**APENAS SELECT**). O cliente não pode forjar ou estender licenças diretamente. Atualizações ocorrem estritamente via Service Role nas Edge Functions.
3. `public.user_settings`: `auth.uid() = user_id` (ALL).
4. `public.debloat_lists`: `true` (SELECT público para sincronização de listas de fabricante).

---

## 4. Auditoria Gitleaks / Histórico Git

Executada varredura regex sobre commits e logs de diffs:
- Padrões analisados: chaves privadas, tokens de acesso `sbp_`, tokens Vercel `vcp_`.
- Resultado: Nenhum segredo persistido em arquivos de código versionados. O arquivo `.gitignore` protege explicitamente chaves de release e variáveis locais.
