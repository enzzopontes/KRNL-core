import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export interface PermissionDefinition {
  id: string;
  name: string;
  key: string;
  description: string;
  justification: string;
  isSpecialAccess: boolean;
  requiredFor: string[];
}

export const APP_PERMISSIONS: PermissionDefinition[] = [
  {
    id: 'storage_manage',
    name: 'Acesso a Todos os Arquivos',
    key: 'MANAGE_EXTERNAL_STORAGE',
    description: 'Permite encontrar arquivos grandes, duplicadas e limpar pastas residuais.',
    justification:
      'Necessário para o Explorador de Pastas, Treemap visual e varredura de lixo em diretórios fora da mídia.',
    isSpecialAccess: true,
    requiredFor: ['Limpeza de Lixo', 'Treemap', 'Varredura Global'],
  },
  {
    id: 'media_images_video',
    name: 'Fotos e Vídeos',
    key: 'READ_MEDIA_VISUAL',
    description: 'Acesso às mídias para identificação de fotos duplicadas e borradas.',
    justification:
      'Permite ao algoritmo dHash analisar fotos similares localmente sem enviar nada à internet.',
    isSpecialAccess: false,
    requiredFor: ['Fotos Semelhantes', 'Duplicadas Visuais', 'Prints Antigos'],
  },
  {
    id: 'usage_stats',
    name: 'Estatísticas de Uso de Apps',
    key: 'PACKAGE_USAGE_STATS',
    description: 'Identifica aplicativos não utilizados há 30, 60 ou 90 dias.',
    justification:
      'Gera a lista de desuso no Gerenciador de Apps para você recuperar armazenamento real.',
    isSpecialAccess: true,
    requiredFor: ['Gerenciador de Apps', 'Apps Inativos'],
  },
  {
    id: 'notifications',
    name: 'Notificações Críticas',
    key: 'POST_NOTIFICATIONS',
    description: 'Alertas escassos de armazenamento crítico (> 85%) e status de tarefas longas.',
    justification:
      'O app nunca envia notificações promocionais; apenas relatórios de rotina autorizados.',
    isSpecialAccess: false,
    requiredFor: ['Alertas de Espaço Baixo', 'WorkManager Semanal'],
  },
];

export async function openSpecialPermissionSettings(permissionId: string): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    if (permissionId === 'storage_manage') {
      await IntentLauncher.startActivityAsync(
        'android.settings.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION',
        { data: 'package:com.krnl.core' }
      );
    } else if (permissionId === 'usage_stats') {
      await IntentLauncher.startActivityAsync(
        'android.settings.USAGE_ACCESS_SETTINGS'
      );
    } else {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        { data: 'package:com.krnl.core' }
      );
    }
  } catch {
    // Fallback to app details
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
      { data: 'package:com.krnl.core' }
    ).catch(() => {});
  }
}
