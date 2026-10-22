export interface DebloatItem {
  id: string;
  manufacturer: string;
  packageName: string;
  label: string;
  riskLevel: 'RECOMMENDED' | 'ADVANCED' | 'DANGEROUS' | 'CRITICAL';
  description: string;
}

export const LOCAL_DEBLOAT_CACHE: DebloatItem[] = [
  {
    id: 'samsung-1',
    manufacturer: 'samsung',
    packageName: 'com.samsung.android.bixby.agent',
    label: 'Bixby Voice',
    riskLevel: 'RECOMMENDED',
    description: 'Assistente de voz Samsung.',
  },
  {
    id: 'samsung-2',
    manufacturer: 'samsung',
    packageName: 'com.samsung.android.game.gamehome',
    label: 'Game Launcher',
    riskLevel: 'RECOMMENDED',
    description: 'Central de jogos da Samsung com telemetria.',
  },
  {
    id: 'xiaomi-1',
    manufacturer: 'xiaomi',
    packageName: 'com.miui.analytics',
    label: 'MIUI Analytics',
    riskLevel: 'RECOMMENDED',
    description: 'Serviço de análise de telemetria da Xiaomi.',
  },
  {
    id: 'xiaomi-2',
    manufacturer: 'xiaomi',
    packageName: 'com.miui.msa.global',
    label: 'MIUI System Ads',
    riskLevel: 'RECOMMENDED',
    description: 'Serviço de publicidade integrada da MIUI.',
  },
  {
    id: 'univ-1',
    manufacturer: 'universal',
    packageName: 'com.facebook.katana',
    label: 'Facebook',
    riskLevel: 'RECOMMENDED',
    description: 'Aplicativo pré-instalado.',
  },
  {
    id: 'univ-2',
    manufacturer: 'universal',
    packageName: 'com.facebook.system',
    label: 'Facebook App Installer',
    riskLevel: 'RECOMMENDED',
    description: 'Instalador em segundo plano.',
  },
  {
    id: 'univ-critical',
    manufacturer: 'universal',
    packageName: 'com.android.systemui',
    label: 'System UI',
    riskLevel: 'CRITICAL',
    description: 'Interface de usuário do sistema Android.',
  },
];
