-- Migration Rodada 2: RLS restritivo para licenses e debloat_lists

-- 1. Debloat Lists curadas por fabricante
CREATE TABLE IF NOT EXISTS public.debloat_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer TEXT NOT NULL, -- 'samsung', 'xiaomi', 'motorola', 'google', 'universal'
  package_name TEXT NOT NULL,
  label TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('RECOMMENDED', 'ADVANCED', 'DANGEROUS', 'CRITICAL')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(manufacturer, package_name)
);

ALTER TABLE public.debloat_lists ENABLE ROW LEVEL SECURITY;

-- debloat_lists pode ser lida publicamente (anon ou autenticado)
CREATE POLICY "Public read debloat_lists"
  ON public.debloat_lists FOR SELECT
  USING (true);

-- 2. Restringir licenses: NENHUM INSERT OU UPDATE PERMITIDO DIRETAMENTE PELO CLIENTE!
-- Drop antigas policies permissivas caso existam
DROP POLICY IF EXISTS "Users can view own licenses" ON public.licenses;
DROP POLICY IF EXISTS "Users can insert own licenses" ON public.licenses;
DROP POLICY IF EXISTS "Users can update own licenses" ON public.licenses;

-- Somente leitura pelo dono
CREATE POLICY "Users can only read own licenses"
  ON public.licenses FOR SELECT
  USING (auth.uid() = user_id);

-- Inserir debloat inicial curado
INSERT INTO public.debloat_lists (manufacturer, package_name, label, risk_level, description)
VALUES
  ('samsung', 'com.samsung.android.bixby.agent', 'Bixby Voice', 'RECOMMENDED', 'Assistente de voz Samsung.'),
  ('samsung', 'com.samsung.android.game.gamehome', 'Game Launcher', 'RECOMMENDED', 'Serviço de jogos Samsung com telemetria.'),
  ('samsung', 'com.sec.android.app.sbrowser', 'Samsung Internet', 'ADVANCED', 'Navegador padrão da Samsung.'),
  ('xiaomi', 'com.miui.analytics', 'MIUI Analytics', 'RECOMMENDED', 'Serviço de métricas da Xiaomi.'),
  ('xiaomi', 'com.miui.msa.global', 'MIUI System Ads', 'RECOMMENDED', 'Serviço de publicidade embutida da Xiaomi.'),
  ('universal', 'com.facebook.katana', 'Facebook', 'RECOMMENDED', 'Aplicativo principal do Facebook pré-instalado.'),
  ('universal', 'com.facebook.system', 'Facebook App Installer', 'RECOMMENDED', 'Instalador em segundo plano do Facebook.'),
  ('universal', 'com.facebook.appmanager', 'Facebook App Manager', 'RECOMMENDED', 'Gerenciador de telemetria e updates da Meta.'),
  ('universal', 'com.android.systemui', 'System UI', 'CRITICAL', 'Interface gráfica do Android. Não remover sob risco de bootloop.')
ON CONFLICT (manufacturer, package_name) DO NOTHING;
