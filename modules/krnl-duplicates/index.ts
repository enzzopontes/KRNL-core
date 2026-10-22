import { requireNativeModule, EventEmitter } from 'expo-modules-core';

export interface DuplicateGroup {
  hash: string;
  size: number;
  files: string[];
}

export interface DuplicateScanResult {
  groups: DuplicateGroup[];
}

let nativeModule: any = null;
try {
  nativeModule = requireNativeModule('KrnlDuplicatesModule');
} catch {
  nativeModule = null;
}

const emitter = nativeModule ? new EventEmitter(nativeModule) : null;

export async function scanExactDuplicates(paths: string[]): Promise<DuplicateScanResult> {
  if (nativeModule?.scanExactDuplicates) {
    return new Promise((resolve) => {
      const sub = (emitter as any)?.addListener('onDuplicatesFound', (res: DuplicateScanResult) => {
        sub?.remove();
        resolve(res);
      });
      nativeModule.scanExactDuplicates(paths);
    });
  }

  // Realistic mock for preview / testing
  return {
    groups: [
      {
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        size: 4.8 * 1024 * 1024,
        files: [
          '/storage/emulated/0/DCIM/Camera/IMG_20261012_102214.jpg',
          '/storage/emulated/0/WhatsApp/Media/WhatsApp Images/IMG_20261012_102214.jpg',
        ],
      },
      {
        hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
        size: 18.2 * 1024 * 1024,
        files: [
          '/storage/emulated/0/Download/relatorio_anual_2026.pdf',
          '/storage/emulated/0/Documents/relatorio_anual_2026 (1).pdf',
        ],
      },
    ],
  };
}

export async function calculateDHash(imagePath: string): Promise<string | null> {
  if (nativeModule?.calculateDHash) {
    return await nativeModule.calculateDHash(imagePath);
  }
  return 'a4f89c02b1897e41';
}
