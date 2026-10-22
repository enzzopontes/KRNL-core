import { create } from 'zustand';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import * as Device from 'expo-device';
import { calculateHealthIndex, HardwareTelemetry, HealthBreakdown } from './telemetry';

interface TelemetryState {
  telemetry: HardwareTelemetry;
  health: HealthBreakdown;
  isLoading: boolean;
  refreshTelemetry: () => Promise<void>;
}

const defaultTelemetry: HardwareTelemetry = {
  storageTotalBytes: 128 * 1024 * 1024 * 1024,
  storageFreeBytes: 38 * 1024 * 1024 * 1024,
  storageUsedPercent: 70,

  ramTotalBytes: 8 * 1024 * 1024 * 1024,
  ramFreeBytes: 3.2 * 1024 * 1024 * 1024,
  ramUsedPercent: 60,

  batteryLevel: 85,
  batteryIsCharging: false,
  batteryTemperature: 31,

  networkType: 'WIFI',
  networkIsConnected: true,

  cpuCores: Device.totalMemory ? 8 : 8,
  androidVersion: Device.osVersion ?? '14',
  securityPatchDate: '2026-09-01',
  isAdbEnabled: false,
};

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  telemetry: defaultTelemetry,
  health: calculateHealthIndex(defaultTelemetry),
  isLoading: false,

  refreshTelemetry: async () => {
    set({ isLoading: true });
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync().catch(() => 0.85);
      const batteryState = await Battery.getBatteryStateAsync().catch(() => Battery.BatteryState.UNPLUGGED);
      const network = await Network.getNetworkStateAsync().catch(() => ({
        type: Network.NetworkStateType.WIFI,
        isConnected: true,
      }));

      const isCharging =
        batteryState === Battery.BatteryState.CHARGING ||
        batteryState === Battery.BatteryState.FULL;

      const current = get().telemetry;
      const updated: HardwareTelemetry = {
        ...current,
        batteryLevel: Math.round((batteryLevel < 0 ? 0.85 : batteryLevel) * 100),
        batteryIsCharging: isCharging,
        networkType: network.type === Network.NetworkStateType.CELLULAR ? 'CELLULAR' : 'WIFI',
        networkIsConnected: !!network.isConnected,
      };

      set({
        telemetry: updated,
        health: calculateHealthIndex(updated),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
