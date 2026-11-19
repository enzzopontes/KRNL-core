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

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  lastModified: number;
}

export interface CategorySizes {
  photos: number;
  videos: number;
  downloads: number;
  audio: number;
  docs: number;
  apks: number;
  others: number;
}

export interface LargeFileItem {
  name: string;
  path: string;
  size: number;
  lastModified: number;
  category: string;
}

export interface ScreenshotOrRecordingItem {
  name: string;
  path: string;
  size: number;
  lastModified: number;
  isDirectory: boolean;
  type: 'SCREENSHOT' | 'RECORDING';
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

export async function listFiles(dirPath = ''): Promise<FileItem[]> {
  if (nativeModule?.listFiles) {
    return await nativeModule.listFiles(dirPath);
  }
  return [
    { name: 'Download', path: '/storage/emulated/0/Download', isDirectory: true, size: 4096, lastModified: Date.now() - 3600000 },
    { name: 'DCIM', path: '/storage/emulated/0/DCIM', isDirectory: true, size: 4096, lastModified: Date.now() - 7200000 },
    { name: 'Documents', path: '/storage/emulated/0/Documents', isDirectory: true, size: 4096, lastModified: Date.now() - 86400000 },
    { name: 'Pictures', path: '/storage/emulated/0/Pictures', isDirectory: true, size: 4096, lastModified: Date.now() - 172800000 },
    { name: 'Music', path: '/storage/emulated/0/Music', isDirectory: true, size: 4096, lastModified: Date.now() - 259200000 },
  ];
}

export async function getCategorySizes(): Promise<CategorySizes> {
  if (nativeModule?.getCategorySizes) {
    return await nativeModule.getCategorySizes();
  }
  return {
    photos: 24.5 * 1024 * 1024 * 1024,
    videos: 38.2 * 1024 * 1024 * 1024,
    downloads: 12.1 * 1024 * 1024 * 1024,
    audio: 4.8 * 1024 * 1024 * 1024,
    docs: 2.3 * 1024 * 1024 * 1024,
    apks: 1.9 * 1024 * 1024 * 1024,
    others: 2.2 * 1024 * 1024 * 1024,
  };
}

export async function getLargeFiles(minSizeBytes = 10 * 1024 * 1024): Promise<LargeFileItem[]> {
  if (nativeModule?.getLargeFiles) {
    return await nativeModule.getLargeFiles(minSizeBytes);
  }
  return [
    { name: 'update_pkg_v4.2.apk', path: '/storage/emulated/0/Download/update_pkg_v4.2.apk', size: 145 * 1024 * 1024, lastModified: Date.now() - 10000000, category: 'APKS' },
    { name: 'screen_record_2026.mp4', path: '/storage/emulated/0/Movies/ScreenRecorder/screen_record_2026.mp4', size: 320 * 1024 * 1024, lastModified: Date.now() - 20000000, category: 'VIDEOS' },
    { name: 'backup_archive.zip', path: '/storage/emulated/0/Download/backup_archive.zip', size: 512 * 1024 * 1024, lastModified: Date.now() - 30000000, category: 'DOWNLOADS' },
  ];
}

export async function getScreenshotsAndRecordings(): Promise<ScreenshotOrRecordingItem[]> {
  if (nativeModule?.getScreenshotsAndRecordings) {
    return await nativeModule.getScreenshotsAndRecordings();
  }
  return [
    { name: 'Screenshot_20261022_1201.png', path: '/storage/emulated/0/Pictures/Screenshots/Screenshot_20261022_1201.png', size: 2.4 * 1024 * 1024, lastModified: Date.now() - 1800000, isDirectory: false, type: 'SCREENSHOT' },
    { name: 'Screen_Recording_20261020.mp4', path: '/storage/emulated/0/DCIM/ScreenRecorder/Screen_Recording_20261020.mp4', size: 85 * 1024 * 1024, lastModified: Date.now() - 172800000, isDirectory: false, type: 'RECORDING' },
  ];
}
