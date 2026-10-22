# KRNL Core — Registro de Decisões Técnicas

- 2026-10-22: Stack fixada em Expo SDK 57 (React Native 0.86.3, React 19.2.3, Hermes, Nova Arquitetura).
- 2026-10-22: minSdkVersion definido para 30 (Android 11) com targetSdkVersion 36 (Android 16).
- 2026-10-22: Expo Router selecionado para navegação baseada em arquivos (`src/app`).
- 2026-10-22: Design tokens mantidos em MMKV + Zustand com suporte a temas AMOLED #000000, Branco Técnico e Auto.
- 2026-10-22: Configurados dois product flavors Android: `play` (com.krnl.core) e `direct` (com.krnl.core.direct). Shizuku restrito exclusivamente ao flavor `direct`.
- 2026-10-22: Fórmula da nota de saúde do aparelho aberta e auditável (0 a 100) baseada em 4 pilares: Armazenamento (35%), Bateria/Temperatura (25%), Higiene de Apps (20%) e Segurança de Sistema (20%).
- 2026-10-22: Módulo de armazenamento nativo (Kotlin) criado via Expo Modules API. Limpeza de lixo adota sempre modo simulação (dry-run) prévia e quarentena interna em vez de deleção imediata.
- 2026-10-22: Algoritmo de identificação de duplicadas opera em 3 etapas nativas em Kotlin (tamanho exato -> MD5/xxHash parcial de início/meio/fim -> SHA-256 completo apenas para empatados). dHash 64-bit implementado para imagens similares.
- 2026-10-22: Gerenciador de Apps e Debloater seguro utilizam PackageManager nativo e intenção oficial do sistema para gerenciar pacotes. Pacotes do núcleo do sistema (ex: SystemUI) são permanentemente travados contra manipulação.
- 2026-10-22: Automação via WorkManager configurada com restrições rígidas (apenas enquanto carrega e conectado ao Wi-Fi). Suporte a Shizuku estritamente bloqueado em tempo de compilação fora do flavor direct.
- 2026-10-22: Conta e Cobrança desenhadas com suporte simultâneo a Google Play Billing e Mercado Pago (PIX/Cartão via Supabase Edge Functions). Schema SQL com RLS ativado e webhooks idempotentes.
