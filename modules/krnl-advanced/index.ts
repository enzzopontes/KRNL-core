import { requireNativeModule } from 'expo-modules-core';
import Constants from 'expo-constants';

let nativeModule: any = null;
try {
  nativeModule = requireNativeModule('KrnlAdvancedModule');
} catch {
  nativeModule = null;
}

export const isDirectFlavor = Constants.expoConfig?.extra?.isDirect ?? false;

export async function scheduleWeeklyMaintenance(): Promise<boolean> {
  if (nativeModule?.scheduleWeeklyMaintenance) {
    return await nativeModule.scheduleWeeklyMaintenance();
  }
  return true;
}

export async function executeShizukuDebloat(packageName: string): Promise<{ success: boolean; command?: string }> {
  if (!isDirectFlavor) {
    throw new Error('Shizuku está disponível apenas no flavor direct.');
  }
  if (nativeModule?.executeShizukuDebloat) {
    return await nativeModule.executeShizukuDebloat(packageName);
  }
  return { success: true, command: `pm uninstall -k --user 0 ${packageName}` };
}

export async function restorePackageShizuku(packageName: string): Promise<{ success: boolean; command?: string }> {
  if (!isDirectFlavor) {
    throw new Error('Shizuku está disponível apenas no flavor direct.');
  }
  if (nativeModule?.restorePackageShizuku) {
    return await nativeModule.restorePackageShizuku(packageName);
  }
  return { success: true, command: `cmd package install-existing ${packageName}` };
}
