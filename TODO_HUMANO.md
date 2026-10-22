# KRNL Core — Itens Pendentes de Ação Humana

1. **Pesquisa de Marca / Registro**:
   - Nome "KRNL Core": verificar disponibilidade de marca registrada e potenciais conflitos no segmento de utilitários móveis.

2. **Declaração de Permissão QUERY_ALL_PACKAGES (Play Console)**:
   - O app lista aplicativos para o Gerenciador de Apps, Inatividade (30/60/90 dias) e Debloater Seguro.
   - Preencher na Play Console a justificativa de necessidade central de gerenciamento de dispositivos para obter a isenção de política.

3. **Política de Privacidade, LGPD e Política de Reembolso**:
   - Elaborar documento jurídico formal informando:
     - Nenhum dado pessoal, foto, índice ou arquivo é transmitido a servidores.
     - Coleta mínima de telemetria de crashes via Sentry (opt-in).
     - Direito de arrependimento de 7 dias (Código de Defesa do Consumidor / LGPD) para pagamentos via PIX Mercado Pago e Google Play Billing.

4. **Programa de Cobrança Alternativa do Google (User Choice Billing)**:
   - Habilitar no Google Play Console a opção de faturamento por escolha do usuário para o território brasileiro.
   - Configurar o relatório de transações alternativas de acordo com as taxas aplicáveis do Google.

5. **Formulário de Segurança dos Dados (Data Safety)**:
   - Declarar no console:
     - **Conta / E-mail**: Coletado apenas se o usuário optar por criar conta Supabase para sync de tema/licença.
     - **Licença / Pagamento**: Processado de forma segura e não vinculado a dados de rastreamento publicitário.
     - **Arquivos e Mídias**: NENHUM dado coletado ou compartilhado externamente.

6. **Chaves de Assinatura (Keystore)**:
   - Armazenar o arquivo `release.keystore` gerado em local seguro (cofre de senhas / CI/CD secrets). NUNCA commitar no Git.

7. **Assets Gráficos da Loja**:
   - Ícone de alta resolução (512x512 PNG).
   - Imagem de recurso gráfico do HUD KRNL (1024x500 PNG).
   - Screenshots de 7" e 10" destacando o Treemap de Disco, Painel HUD e Scanner de Duplicadas.

8. **Licenças Comerciais de Terceiros**:
   - VirusTotal: Contratar plano comercial da API v3 antes de remover o modo STUB.
   - UAD-ng: Manter listas próprias curadas para evitar contaminação por licença GPL-3.0.
