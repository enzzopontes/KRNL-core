import { requireNativeModule } from 'expo-modules-core';

export interface AppInfo {
  packageName: string;
  label: string;
  isSystem: boolean;
  sizeBytes: number;
  targetSdkVersion: number;
  lastUsedDaysAgo?: number;
  debloatRisk?: 'RECOMMENDED' | 'ADVANCED' | 'DANGEROUS' | 'CRITICAL';
}

let nativeModule: any = null;
try {
  nativeModule = requireNativeModule('KrnlAppsModule');
} catch {
  nativeModule = null;
}

export async function getInstalledApps(): Promise<AppInfo[]> {
  if (nativeModule?.getInstalledApps) {
    return await nativeModule.getInstalledApps();
  }

  // Curated list for development and testing
  return [
    {
      packageName: 'com.facebook.katana',
      label: 'Facebook',
      isSystem: true,
      sizeBytes: 184 * 1024 * 1024,
      targetSdkVersion: 34,
      lastUsedDaysAgo: 62,
      debloatRisk: 'RECOMMENDED',
    },
    {
      packageName: 'com.samsung.android.bixby.agent',
      label: 'Bixby Voice',
      isSystem: true,
      sizeBytes: 78 * 1024 * 1024,
      targetSdkVersion: 34,
      lastUsedDaysAgo: 110,
      debloatRisk: 'RECOMMENDED',
    },
    {
      packageName: 'com.google.android.googlequicksearchbox',
      label: 'Google App',
      isSystem: true,
      sizeBytes: 240 * 1024 * 1024,
      targetSdkVersion: 35,
      lastUsedDaysAgo: 4,
      debloatRisk: 'ADVANCED',
    },
    {
      packageName: 'com.android.systemui',
      label: 'System UI',
      isSystem: true,
      sizeBytes: 42 * 1024 * 1024,
      targetSdkVersion: 35,
      lastUsedDaysAgo: 0,
      debloatRisk: 'CRITICAL',
    },
  ];
}

export async function openAppDetails(packageName: string): Promise<boolean> {
  if (nativeModule?.openAppDetails) {
    return await nativeModule.openAppDetails(packageName);
  }
  return true;
}

export async function requestUninstall(packageName: string): Promise<boolean> {
  if (nativeModule?.requestUninstall) {
    return await nativeModule.requestUninstall(packageName);
  }
  return true;
}
