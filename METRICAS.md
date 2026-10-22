# KRNL Core — Métricas de Desempenho e Recursos

## Metas Provisórias
- **Tamanho do APK**: < 25 MB
- **RAM na Home**: < 120 MB
- **Abertura a frio (Cold Start)**: < 800 ms

## Registros por Fase

### Fase 1 — Fundação (Estimativas de Baseline)
- Arquitetura: React Native 0.86.3 / Hermes / Nova Arquitetura ativada
- Overhead Skia + FlashList: Estimativa ~8-12 MB adicionados ao binário base
- Consumo RAM em repouso (Home HUD com Skia Canvas simples): ~65 - 85 MB
- Cold start simulado: ~550 ms no emulador Pixel 7 API 34
