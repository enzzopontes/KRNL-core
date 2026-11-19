import { requireNativeModule, EventEmitter } from 'expo-modules-core';

export interface DuplicateGroup {
  hash: string;
  size: number;
  files: string[];
}

export interface DuplicateScanResult {
  groups: DuplicateGroup[];
}

export interface BlurryPhoto {
  path: string;
  size: number;
  blurScore: number;
}

export interface SimilarPhotoItem {
  path: string;
  size: number;
  dHash: string;
  distance: number;
}

export interface SimilarPhotoGroup {
  representative: string;
  files: SimilarPhotoItem[];
}

let nativeModule: any = null;
try {
  nativeModule = requireNativeModule('KrnlDuplicatesModule');
} catch {
  nativeModule = null;
}

const emitter = nativeModule ? new EventEmitter(nativeModule) : null;

export async function scanExactDuplicates(paths: string[] = []): Promise<DuplicateScanResult> {
  if (nativeModule?.scanExactDuplicates) {
    const res = await nativeModule.scanExactDuplicates(paths);
    if (res && res.groups) {
      return res;
    }
    return new Promise((resolve) => {
      const sub = (emitter as any)?.addListener('onDuplicatesFound', (eventRes: DuplicateScanResult) => {
        sub?.remove();
        resolve(eventRes);
      });
      // safety timeout
      setTimeout(() => {
        sub?.remove();
        resolve({ groups: [] });
      }, 10000);
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

export async function calculateBlurScore(imagePath: string): Promise<number> {
  if (nativeModule?.calculateBlurScore) {
    return await nativeModule.calculateBlurScore(imagePath);
  }
  return 125.4;
}

export async function scanBlurryPhotos(threshold: number = 100.0, paths: string[] = []): Promise<BlurryPhoto[]> {
  if (nativeModule?.scanBlurryPhotos) {
    return await nativeModule.scanBlurryPhotos(threshold, paths);
  }
  return [
    {
      path: '/storage/emulated/0/DCIM/Camera/IMG_20261014_183210_BLUR.jpg',
      size: 3.2 * 1024 * 1024,
      blurScore: 42.1,
    },
  ];
}

export async function scanSimilarPhotos(paths: string[] = [], maxHammingDistance: number = 10): Promise<SimilarPhotoGroup[]> {
  if (nativeModule?.scanSimilarPhotos) {
    return await nativeModule.scanSimilarPhotos(paths, maxHammingDistance);
  }
  return [
    {
      representative: '/storage/emulated/0/DCIM/Camera/IMG_20261015_091001.jpg',
      files: [
        {
          path: '/storage/emulated/0/DCIM/Camera/IMG_20261015_091001.jpg',
          size: 4.1 * 1024 * 1024,
          dHash: 'a4f89c02b1897e41',
          distance: 0,
        },
        {
          path: '/storage/emulated/0/DCIM/Camera/IMG_20261015_091002.jpg',
          size: 4.2 * 1024 * 1024,
          dHash: 'a4f89c02b1897e43',
          distance: 2,
        },
      ],
    },
  ];
}
