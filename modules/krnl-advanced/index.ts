import { requireNativeModule } from 'expo-modules-core';

let nativeModule: any = null;
try {
  nativeModule = requireNativeModule('KrnlAdvancedModule');
} catch {
  nativeModule = null;
}

export async function scheduleWeeklyMaintenance(): Promise<boolean> {
  if (nativeModule?.scheduleWeeklyMaintenance) {
    return await nativeModule.scheduleWeeklyMaintenance();
  }
  return true;
}
