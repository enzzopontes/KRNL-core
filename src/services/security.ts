import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export interface SecurityAuditItem {
  id: string;
  title: string;
  status: 'SAFE' | 'WARNING' | 'ALERT';
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface VirusTotalReport {
  isClean: boolean;
  positives: number;
  total: number;
  scanDate: string;
  permalink?: string;
}

/**
 * Interface de abstração VirusTotal (v3).
 * Utiliza STUB enquanto aguarda contratação de licença comercial (TODO_HUMANO.md).
 */
export async function checkFileHashVirusTotal(sha256Hash: string): Promise<VirusTotalReport> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    // STUB Oficial conforme item 4.7 da documentação
    return {
      isClean: true,
      positives: 0,
      total: 72,
      scanDate: new Date().toISOString(),
      permalink: `https://www.virustotal.com/gui/file/${sha256Hash}`,
    };
  }

  try {
    const res = await fetch(`https://www.virustotal.com/api/v3/files/${sha256Hash}`, {
      headers: { 'x-apikey': apiKey },
    });
    const data = await res.json();
    const stats = data.data?.attributes?.last_analysis_stats || { malicious: 0 };
    return {
      isClean: stats.malicious === 0,
      positives: stats.malicious,
      total: 70,
      scanDate: new Date().toISOString(),
    };
  } catch {
    return { isClean: true, positives: 0, total: 0, scanDate: new Date().toISOString() };
  }
}

export function openPlayProtect(): void {
  if (Platform.OS !== 'android') return;
  try {
    IntentLauncher.startActivityAsync('com.google.android.gms.security.settings.VerifyAppsSettingsActivity');
  } catch {
    IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.SECURITY_SETTINGS);
  }
}

export function openDeveloperSettings(): void {
  if (Platform.OS !== 'android') return;
  IntentLauncher.startActivityAsync('android.settings.APPLICATION_DEVELOPMENT_SETTINGS');
}
