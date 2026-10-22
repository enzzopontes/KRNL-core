export interface HardwareTelemetry {
  storageTotalBytes: number;
  storageFreeBytes: number;
  storageUsedPercent: number;

  ramTotalBytes: number;
  ramFreeBytes: number;
  ramUsedPercent: number;

  batteryLevel: number; // 0 to 100
  batteryIsCharging: boolean;
  batteryTemperature: number; // in Celsius

  networkType: 'WIFI' | 'CELLULAR' | 'NONE' | 'UNKNOWN';
  networkIsConnected: boolean;

  cpuCores: number;
  androidVersion: string;
  securityPatchDate: string;
  isAdbEnabled: boolean;
}

export interface HealthBreakdown {
  storageScore: number;      // 0 - 35 pts
  batteryScore: number;      // 0 - 25 pts
  ramHygieneScore: number;   // 0 - 20 pts
  securityScore: number;     // 0 - 20 pts
  totalScore: number;        // 0 - 100 pts
  explanations: string[];
}

/**
 * Auditável e transparente:
 * 1. Armazenamento (35 pts): 100% se livre > 25%, decai proporcional até 0 se livre < 5%.
 * 2. Bateria/Temperatura (25 pts): penaliza temperatura > 40°C ou bateria crítica descarregando.
 * 3. RAM / Pressão (20 pts): baseado no uso livre da RAM do sistema.
 * 4. Segurança / Sistema (20 pts): penaliza ADB ligado desnecessariamente, Wi-Fi aberto ou patch antigo.
 */
export function calculateHealthIndex(telemetry: HardwareTelemetry): HealthBreakdown {
  const explanations: string[] = [];

  // 1. Armazenamento (peso 35)
  const freeStorageRatio = telemetry.storageTotalBytes > 0
    ? telemetry.storageFreeBytes / telemetry.storageTotalBytes
    : 1;
  let storageScore = 35;
  if (freeStorageRatio < 0.05) {
    storageScore = 5;
    explanations.push('Armazenamento crítico (< 5% livre): -30 pts');
  } else if (freeStorageRatio < 0.15) {
    storageScore = 18;
    explanations.push('Armazenamento baixo (< 15% livre): -17 pts');
  } else if (freeStorageRatio < 0.25) {
    storageScore = 28;
    explanations.push('Armazenamento moderado (< 25% livre): -7 pts');
  } else {
    explanations.push('Armazenamento saudável (> 25% livre): +35 pts');
  }

  // 2. Bateria e Temperatura (peso 25)
  let batteryScore = 25;
  if (telemetry.batteryTemperature > 45) {
    batteryScore -= 15;
    explanations.push(`Temperatura da bateria alta (${telemetry.batteryTemperature}°C): -15 pts`);
  } else if (telemetry.batteryTemperature > 38) {
    batteryScore -= 6;
    explanations.push(`Temperatura da bateria morna (${telemetry.batteryTemperature}°C): -6 pts`);
  } else {
    explanations.push(`Temperatura da bateria ideal (${telemetry.batteryTemperature}°C): total`);
  }

  if (telemetry.batteryLevel < 15 && !telemetry.batteryIsCharging) {
    batteryScore = Math.max(0, batteryScore - 5);
    explanations.push('Bateria crítica (< 15% e sem carregamento): -5 pts');
  }

  // 3. RAM (peso 20)
  let ramHygieneScore = 20;
  if (telemetry.ramUsedPercent > 90) {
    ramHygieneScore = 5;
    explanations.push('Pressão alta de RAM (> 90% em uso): -15 pts');
  } else if (telemetry.ramUsedPercent > 80) {
    ramHygieneScore = 12;
    explanations.push('Uso elevado de RAM (> 80%): -8 pts');
  } else {
    explanations.push('Pressão de memória normal: +20 pts');
  }

  // 4. Segurança (peso 20)
  let securityScore = 20;
  if (telemetry.isAdbEnabled) {
    securityScore -= 5;
    explanations.push('Depuração USB / ADB ativa em segundo plano: -5 pts');
  }
  if (!telemetry.networkIsConnected) {
    explanations.push('Dispositivo desconectado');
  }

  const totalScore = Math.max(0, Math.min(100, Math.round(
    storageScore + batteryScore + ramHygieneScore + securityScore
  )));

  return {
    storageScore,
    batteryScore,
    ramHygieneScore,
    securityScore,
    totalScore,
    explanations,
  };
}
