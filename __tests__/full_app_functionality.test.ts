jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 35 },
}));

jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: jest.fn(),
}));

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    set: jest.fn(),
    getString: jest.fn(),
    remove: jest.fn(),
  }),
}));

import { AMOLED_THEME, LIGHT_THEME, palette, accents, semantic } from '../src/design/tokens';
import { useThemeStore } from '../src/design/store';
import { calculateHealthIndex } from '../src/services/telemetry';
import { APP_PERMISSIONS } from '../src/services/permissions';
import { checkFileHashVirusTotal } from '../src/services/security';

describe('App Integrity & Functional Verification', () => {
  it('verifies HUD design tokens and contrast standards', () => {
    expect(palette.bg).toBe('#000000');
    expect(palette.surface1).toBe('#0A0A0A');
    expect(accents.white).toBe('#FFFFFF');
    expect(accents.cyan).toBe('#22D3EE');
    expect(semantic.danger).toBe('#F87171');
    expect(semantic.ok).toBe('#4ADE80');
    expect(AMOLED_THEME.background).toBe('#000000');
    expect(LIGHT_THEME.background).toBe('#F5F5F5');
  });

  it('verifies theme store state transitions and high contrast mode', () => {
    const store = useThemeStore.getState();

    store.setAccentColor('#22D3EE');
    expect(useThemeStore.getState().accentColor).toBe('#22D3EE');

    store.setHighContrast(true);
    const colorsHC = useThemeStore.getState().getColors();
    expect(colorsHC.border).toBe('#4D4D4D');
    expect(colorsHC.borderActive).toBe('#FFFFFF');

    store.setHighContrast(false);
    const colorsNormal = useThemeStore.getState().getColors();
    expect(colorsNormal.border).toBe('#1F1F1F');

    store.setReduceMotion(true);
    expect(useThemeStore.getState().reduceMotion).toBe(true);

    store.setExpertMode(true);
    expect(useThemeStore.getState().expertMode).toBe(true);
  });

  it('verifies health index algorithm transparency', () => {
    const telemetry = {
      androidVersion: '15',
      apiLevel: 35,
      storageTotalBytes: 128 * 1024 * 1024 * 1024,
      storageFreeBytes: 64 * 1024 * 1024 * 1024,
      storageUsedPercent: 50,
      ramTotalBytes: 8 * 1024 * 1024 * 1024,
      ramFreeBytes: 4 * 1024 * 1024 * 1024,
      ramAvailableBytes: 4 * 1024 * 1024 * 1024,
      ramUsedPercent: 50,
      cpuCores: 8,
      securityPatchDate: '2026-10-01',
      isAdbEnabled: false,
      batteryLevel: 80,
      batteryTemperature: 30,
      batteryIsCharging: false,
      networkType: 'WIFI' as const,
      networkIsConnected: true,
      lastScanTimestamp: Date.now(),
    };

    const health = calculateHealthIndex(telemetry);
    expect(health.totalScore).toBeGreaterThanOrEqual(80);
    expect(health.storageScore).toBe(35);
    expect(health.batteryScore).toBe(25);
    expect(health.explanations.length).toBeGreaterThan(0);
  });

  it('verifies security virusTotal stub audit', async () => {
    const res = await checkFileHashVirusTotal('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(res.isClean).toBe(true);
    expect(res.positives).toBe(0);
    expect(res.scanDate).toBeDefined();
  });

  it('verifies permission definitions integrity', () => {
    expect(APP_PERMISSIONS.length).toBeGreaterThan(0);
    const storagePerm = APP_PERMISSIONS.find((p) => p.id === 'storage_manage');
    expect(storagePerm).toBeDefined();
    expect(storagePerm?.isSpecialAccess).toBe(true);
    expect(storagePerm?.description).toContain('arquivos');
  });
});
