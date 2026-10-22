# KRNL Core — Itens Pendentes de Ação Humana

1. **Pesquisa de Marca / Registro**:
   - Nome "KRNL Core": verificar disponibilidade de marca registrada e potenciais conflitos no segmento de software móvel/utilitários.
2. **Credenciais Supabase**:
   - Criar projeto no Supabase e preencher `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` no `.env`.
3. **Credenciais Mercado Pago**:
   - Obter `MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_PUBLIC_KEY` para as Edge Functions de pagamento alternativo.
4. **Google Play Console**:
   - Preencher declaração de permissão para `MANAGE_EXTERNAL_STORAGE` (Todos os Arquivos) embasada no Explorador de Pastas e Treemap.
   - Preencher formulário de Segurança dos Dados (Data Safety) declarando que nenhum arquivo, foto ou índice sai do dispositivo.
   - Configurar produtos in-app/assinaturas na Play Console (`krnl_pro_monthly`, `krnl_pro_annual`).
5. **Licenciamento de Terceiros**:
   - VirusTotal: confirmar licença comercial da API v3 antes de habilitar checagem em produção.
   - Listas de Debloat: auditar licença da lista UAD-ng antes de importação direta de dados.
