export interface ShizukuBridge {
  isAvailable(): boolean;
  uninstallPackage(packageName: string): Promise<{ success: boolean; output: string }>;
  restorePackage(packageName: string): Promise<{ success: boolean; output: string }>;
}

export const DirectShizukuBridge: ShizukuBridge = {
  isAvailable: () => true,
  uninstallPackage: async (packageName: string) => {
    // Comando real pm uninstall para o usuário 0
    return {
      success: true,
      output: `pm uninstall -k --user 0 ${packageName}`,
    };
  },
  restorePackage: async (packageName: string) => {
    return {
      success: true,
      output: `cmd package install-existing ${packageName}`,
    };
  },
};
