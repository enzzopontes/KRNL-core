import { Platform, PermissionsAndroid } from 'react-native';
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

export async function requestStandardStoragePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const apiLevel = Platform.Version as number;
    if (apiLevel >= 33) {
      const granted = await PermissionsAndroid.requestMultiple([
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_MEDIA_VIDEO',
        'android.permission.READ_MEDIA_AUDIO',
      ] as any);
      const res = granted as Record<string, string>;
      return (
        res['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED ||
        res['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      return granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn('requestStandardStoragePermissions error:', err);
    return false;
  }
}

export async function openSpecialPermissionSettings(permissionId: string): Promise<void> {
  if (Platform.OS !== 'android') return;

  const pkg = 'com.krnl.core.direct';

  try {
    if (permissionId === 'storage_manage') {
      await IntentLauncher.startActivityAsync(
        'android.settings.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION',
        { data: `package:${pkg}` }
      );
    } else if (permissionId === 'usage_stats') {
      await IntentLauncher.startActivityAsync(
        'android.settings.USAGE_ACCESS_SETTINGS'
      );
    } else {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        { data: `package:${pkg}` }
      );
    }
  } catch {
    // Fallback to app details
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
      { data: `package:${pkg}` }
    ).catch(() => {});
  }
}
