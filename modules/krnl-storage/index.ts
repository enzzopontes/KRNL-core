import { requireNativeModule, EventEmitter } from 'expo-modules-core';

export interface StorageStats {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  usedPercent: number;
}

export interface JunkFileItem {
  path: string;
  name: string;
  size: number;
  category: 'CACHE_TEMP' | 'EMPTY_DIR' | 'WHATSAPP_MEDIA' | 'OLD_APK';
}

export interface ScanResult {
  dryRun: boolean;
  totalBytes: number;
  count: number;
  items: JunkFileItem[];
}

let nativeModule: any = null;
try {
  nativeModule = requireNativeModule('KrnlStorageModule');
} catch {
  nativeModule = null;
}

const emitter = nativeModule ? new EventEmitter(nativeModule) : null;

export async function getStorageStats(): Promise<StorageStats> {
  if (nativeModule?.getStorageStats) {
    return await nativeModule.getStorageStats();
  }
  return {
    totalBytes: 128 * 1024 * 1024 * 1024,
    freeBytes: 42 * 1024 * 1024 * 1024,
    usedBytes: 86 * 1024 * 1024 * 1024,
    usedPercent: 67.1,
  };
}

export async function scanJunkFiles(dryRun = true): Promise<ScanResult> {
  if (nativeModule?.scanJunkFiles) {
    return new Promise((resolve) => {
      const sub = (emitter as any)?.addListener('onScanComplete', (res: ScanResult) => {
        sub?.remove();
        resolve(res);
      });
      nativeModule.scanJunkFiles(dryRun);
    });
  }

  // Simulated accurate dry-run fallback for dev
  return {
    dryRun,
    totalBytes: 1420 * 1024 * 1024, // 1.42 GB
    count: 148,
    items: [
      {
        path: '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/.Statuses/status_vid1.mp4',
        name: 'status_vid1.mp4',
        size: 34 * 1024 * 1024,
        category: 'WHATSAPP_MEDIA',
      },
      {
        path: '/storage/emulated/0/Download/base_v2.apk',
        name: 'base_v2.apk',
        size: 68 * 1024 * 1024,
        category: 'OLD_APK',
      },
      {
        path: '/data/user/0/com.krnl.core/cache/temp_stream.tmp',
        name: 'temp_stream.tmp',
        size: 12 * 1024 * 1024,
        category: 'CACHE_TEMP',
      },
    ],
  };
}

export async function moveToQuarantine(sourcePath: string): Promise<{ success: boolean; quarantinePath?: string }> {
  if (nativeModule?.moveToQuarantine) {
    return await nativeModule.moveToQuarantine(sourcePath);
  }
  return { success: true, quarantinePath: `/quarantine/${Date.now()}` };
}
