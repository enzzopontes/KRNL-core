import { calculateHealthIndex, HardwareTelemetry } from '../src/services/telemetry';

describe('Health Index Formula', () => {
  it('gives optimal score when system is pristine', () => {
    const perfect: HardwareTelemetry = {
      storageTotalBytes: 100 * 1024 * 1024 * 1024,
      storageFreeBytes: 50 * 1024 * 1024 * 1024, // 50% free
      storageUsedPercent: 50,
      ramTotalBytes: 8 * 1024 * 1024 * 1024,
      ramFreeBytes: 4 * 1024 * 1024 * 1024,
      ramUsedPercent: 50,
      batteryLevel: 80,
      batteryIsCharging: true,
      batteryTemperature: 30,
      networkType: 'WIFI',
      networkIsConnected: true,
      cpuCores: 8,
      androidVersion: '14',
      securityPatchDate: '2026-10-01',
      isAdbEnabled: false,
    };

    const res = calculateHealthIndex(perfect);
    expect(res.totalScore).toBe(100);
    expect(res.storageScore).toBe(35);
    expect(res.batteryScore).toBe(25);
    expect(res.ramHygieneScore).toBe(20);
    expect(res.securityScore).toBe(20);
  });

  it('penalizes critically low storage and overheating', () => {
    const degraded: HardwareTelemetry = {
      storageTotalBytes: 100 * 1024 * 1024 * 1024,
      storageFreeBytes: 2 * 1024 * 1024 * 1024, // 2% free
      storageUsedPercent: 98,
      ramTotalBytes: 8 * 1024 * 1024 * 1024,
      ramFreeBytes: 400 * 1024 * 1024,
      ramUsedPercent: 95,
      batteryLevel: 10,
      batteryIsCharging: false,
      batteryTemperature: 48, // overheating
      networkType: 'WIFI',
      networkIsConnected: true,
      cpuCores: 8,
      androidVersion: '14',
      securityPatchDate: '2026-10-01',
      isAdbEnabled: true,
    };

    const res = calculateHealthIndex(degraded);
    expect(res.storageScore).toBe(5);
    expect(res.batteryScore).toBeLessThan(15);
    expect(res.ramHygieneScore).toBe(5);
    expect(res.securityScore).toBe(15);
    expect(res.totalScore).toBeLessThan(40);
  });
});
