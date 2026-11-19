# KRNL Core — Progresso do Desenvolvimento

## Status: RODADA 3 CONCLUÍDA (Implementações da Spec Finalizadas)

### Fases Concluídas e Refinadas
- [x] **Fase 1 — Fundação**: Expo 57, HUD Design Tokens, Skia Gauges, anel com fórmula aberta, acessibilidade e suporte i18n PT-BR/EN.
- [x] **Fase 2 — Armazenamento & Explorador Real**:
  - [x] Explorador de Pastas interativo navegável (`listFiles`) sustentando MANAGE_EXTERNAL_STORAGE.
  - [x] Treemap Skia conectado às categorias reais de disco (`getCategorySizes`).
  - [x] Ranking de Arquivos Grandes com filtros por categoria (vídeo, zip, APK, áudio, doc) e sugestão de destino (Mover/Nuvem/Quarentena).
  - [x] Varredura dedicada de prints e gravações de tela (`Pictures/Screenshots` e `DCIM/ScreenRecorder`).
- [x] **Fase 3 — Duplicadas & Fotos Tremidas**:
  - [x] Algoritmo 3-stage nativo com xxHash64 com auto-descoberta de caminhos de mídia.
  - [x] Detecção de fotos borradas/tremidas por variância do Laplaciano com sensibilidade regulável.
  - [x] Comparação de fotos similares por dHash perceptual.
- [x] **Fase 4 — Apps e Segurança**:
  - [x] Gerenciador de Apps com `UsageStats`, inatividade 30/60/90 dias, debloater seguro com listas curadas no Supabase e trava rígida de kernel/SystemUI.
  - [x] Teste real de velocidade de rede, latência (ping RTT) e jitter.
- [x] **Fase 5 — Automação e Notificações**:
  - [x] `KrnlMaintenanceWorker` executando purga de arquivos > 30 dias na quarentena e cache temporário.
  - [x] Notificação de alerta de pouco espaço ao ultrapassar 85% de uso.
  - [x] Quick Settings Tile nativo (`KrnlTileService`) para acionamento na barra do Android.
- [x] **Fase 6 — Conta, Cobrança & Suporte**:
  - [x] Modo Especialista expondo logs técnicos e caminhos de sistema.
  - [x] Central de Suporte e exportação de relatórios diagnósticos em JSON.
  - [x] Gestão de licença, opção de cancelamento manual e termos de reembolso (7 dias CDC).

### Validações da Rodada 3
- [x] 100% de passagem nos testes unitários Jest (10/10 testes passando).
- [x] Zero erros de tipagem TypeScript (`npx tsc --noEmit` limpo).
- [x] Auditoria de conformidade com a documentação de planejamento v1.1.

### Fase 7 — Redesign Visual Completo (KRNL HUD Cockpit & Logos)
- [x] **Identidade Visual e Assets**:
  - Incorporação dos logos oficiais: `logoestendida.png` na topbar e `logo.png` (emblema octagonal "K") no Sobre e Onboarding.
  - Alinhamento de tokens (`palette`, `accents`, `semantic`, `space`, `radius`, `stroke`, `touch` >= 48dp) conforme `krnl-core-design`.
- [x] **Componentes HUD Futuristas**:
  - `HudCard`: 4 marcas de canto L-brackets em 1px, sem sombra suave, suporte a alto contraste.
  - `HudButton`: Alvo mínimo 48dp, contorno accent/danger, preenchimento invertido ao pressionar, chanfros técnicos.
  - `SkiaHealthRing`: Arco 270° calibrado, ticks em single path, números tabulares, memoização Skia zero-allocation.
  - `SkiaMiniGauge`: Medidores em arco 180° com tendência para Armazenamento, RAM, Bateria e Temperatura.
  - `HudWaveSparkline`: Gráfico de ondas futurista (estilo referência) com interpolação cúbica, área de gradiente sutil e ponto de telemetria ativo.
  - `HudSegmentedControl`: Seletor pill futurista (estilo referência) para alternar abas sem poluição visual.
  - `HudHonestCounter`: Contabilidade transparente lado a lado ("Na Lixeira" vs "Liberado Real").
  - `HudRiskBadge`: Selos de risco com ícone + texto + cor (Recomendado, Avançado, Perigoso, Crítico).
  - `HudBottomBar`: Barra de navegação inferior com 5 destinos e alvo >= 48dp.
  - `HudHeader`: Header cockpit com logo, telemetria em tempo real e atalho de configurações.
- [x] **Telas Renovadas**:
  - `DashboardScreen`: Cockpit com anel 270°, grade 2x2 de telemetria, onda de estabilidade e sub-sistemas.
  - `StorageScreen`: Contador honesto, tabs pill, treemap Skia, ranking de grandes arquivos e quarentena.
  - `DuplicatesScreen`: xxHash64, dHash perceptual, detecção de tremidas, aviso Android 14+ e proteção de mensageiros.
  - `AppsManagerScreen`: Filtros 30/60/90 dias, debloat seguro por fabricante com `HudRiskBadge` e auditoria de permissões.
  - `SecurityScreen`: Diagnóstico de rede (ping/jitter/down), vetores reais do SO e verificação VirusTotal sob demanda.
  - `SettingsScreen`: Seletor de cores accent com preview ao vivo, modo alto contraste, reduzir movimento e emblema HUD.
  - `SubscriptionScreen`: Comparação Free vs PRO sem dark patterns, seletor de planos e conformidade CDC.
  - `OnboardingScreen`: Banner hero com logo KRNL e controle modular de permissões com botões Conceder / Agora não.
