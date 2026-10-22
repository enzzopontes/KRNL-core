export interface ShizukuBridge {
  isAvailable(): boolean;
  uninstallPackage(packageName: string): Promise<{ success: boolean; output: string }>;
  restorePackage(packageName: string): Promise<{ success: boolean; output: string }>;
}

// Versão completamente vazia para o flavor Play (garante ausência total de comandos pm no APK)
export const PlayShizukuBridge: ShizukuBridge = {
  isAvailable: () => false,
  uninstallPackage: async () => {
    throw new Error('Debloat avançado via Shizuku não é suportado na versão da Google Play.');
  },
  restorePackage: async () => {
    throw new Error('Restauração via comando de pacote não é suportada na versão da Google Play.');
  },
};
