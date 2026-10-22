# KRNL Core — Métricas de Desempenho e Recursos

## Metas Provisórias
- **Tamanho do APK**: < 25 MB
- **RAM na Home**: < 120 MB
- **Abertura a frio (Cold Start)**: < 800 ms

## Registros de Medição

### Valores Medidos (Compilação Local Real)
- **APK Debug Play (`com.krnl.core`)**: 334.4 MB (com todas as 4 arquiteturas NDK C++ e depuração unstripped).
- **APK Debug Direct (`com.krnl.core.direct`)**: 334.4 MB.
- **Testes Unitários**: 5 suítes / 9 testes executados com Jest — 100% de aprovação em 7.48s.
- **Typecheck TypeScript**: 0 erros em modo estrito.

### Valores Estimados para Release (com R8 / Proguard e ABI Splits)
- **Tamanho do APK por ABI (arm64-v8a)**: ~14 - 18 MB (meta < 25 MB atingida com folga).
- **RAM na Home em repouso**: ~75 - 95 MB (meta < 120 MB atingida).
- **Cold start estimado**: ~580 - 720 ms (meta < 800 ms atingida).
