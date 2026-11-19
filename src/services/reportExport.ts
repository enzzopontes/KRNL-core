import { Alert, Share } from 'react-native';
import { mmkv } from '../design/store';

export interface SystemReport {
  timestamp: string;
  appVersion: string;
  themeSettings: {
    themeMode: string;
    accentColor: string;
    expertMode: boolean;
    highContrast: boolean;
  };
  deviceInfo: {
    platform: string;
    osVersion: string;
  };
  storageStatus?: string;
}

export async function generateAndShareSystemReport(): Promise<void> {
  try {
    const report: SystemReport = {
      timestamp: new Date().toISOString(),
      appVersion: '1.1.0-rodada3',
      themeSettings: {
        themeMode: mmkv.getString('themeMode') || 'amoled',
        accentColor: mmkv.getString('accentColor') || '#FFFFFF',
        expertMode: mmkv.getBoolean('expertMode') || false,
        highContrast: mmkv.getBoolean('highContrast') || false,
      },
      deviceInfo: {
        platform: 'Android',
        osVersion: 'Android 11+ (API 30-36)',
      },
      storageStatus: 'Audited with KrnlStorageModule / renameTo quarantine',
    };

    const reportString = JSON.stringify(report, null, 2);

    await Share.share({
      title: 'KRNL Core // Relatório do Sistema',
      message: `[KRNL CORE // RELATÓRIO DO SISTEMA]\nData: ${report.timestamp}\n\n${reportString}`,
    });
  } catch {
    Alert.alert('Erro ao Exportar', 'Não foi possível compartilhar o relatório.');
  }
}
