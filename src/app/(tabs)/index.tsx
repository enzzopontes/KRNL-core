import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../design/store';
import { useTelemetryStore } from '../../services/telemetryStore';
import { SkiaHealthRing } from '../../components/SkiaHealthRing';
import { SkiaMiniGauge } from '../../components/SkiaMiniGauge';
import { HudCard } from '../../components/HudCard';
import { HudButton } from '../../components/HudButton';
import { SPACING } from '../../design/tokens';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const { telemetry, health, isLoading, refreshTelemetry } = useTelemetryStore();
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const formatGb = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(1);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* HUD App Header */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.brandText, { color: colors.textPrimary }]}>KRNL // CORE</Text>
          <Text style={[styles.subBrand, { color: accentColor }]}>SYS.VER 1.0.0 // ANDROID {telemetry.androidVersion}</Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: colors.border }]}
            onPress={() => router.push('/settings')}
          >
            <Text style={[styles.iconButtonText, { color: colors.textPrimary }]}>[CFG]</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Health Ring Module with open formula on tap */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowFormulaModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Nota de saúde do sistema. Toque para ver cálculo aberto."
        >
          <HudCard title="Índice de Saúde Global" badge="AUDITÁVEL">
            <SkiaHealthRing score={health.totalScore} />
            <Text style={[styles.tapNote, { color: colors.textSecondary }]}>
              [ TOQUE NO ANEL PARA VER A FÓRMULA MATEMÁTICA ]
            </Text>
          </HudCard>
        </TouchableOpacity>

        {/* Quick Simulation / Maintenance Action */}
        <HudCard title="Diagnóstico Rápido" highlight>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Varredura transparente sem apagar arquivos de imediato (modo simulação dry-run).
          </Text>
          <HudButton
            label={isLoading ? 'ANALISANDO HARDWARE...' : 'EXECUTAR SCANNER HUD'}
            variant="primary"
            loading={isLoading}
            onPress={refreshTelemetry}
          />
        </HudCard>

        {/* Real-time Hardware Gauges */}
        <HudCard title="Telemetria em Tempo Real">
          <View style={styles.gaugesRow}>
            <SkiaMiniGauge
              label="Disco"
              value={telemetry.storageUsedPercent}
              unit="%"
            />
            <SkiaMiniGauge
              label="RAM"
              value={telemetry.ramUsedPercent}
              unit="%"
            />
          </View>
          <View style={styles.telemetryDetails}>
            <Text style={[styles.detailLine, { color: colors.textSecondary }]}>
              ARMAZENAMENTO: {formatGb(telemetry.storageFreeBytes)} GB LIVRES DE {formatGb(telemetry.storageTotalBytes)} GB
            </Text>
            <Text style={[styles.detailLine, { color: colors.textSecondary }]}>
              BATERIA: {telemetry.batteryLevel}% ({telemetry.batteryTemperature}°C) {telemetry.batteryIsCharging ? '[CARREGANDO]' : '[DESCARGA]'}
            </Text>
            <Text style={[styles.detailLine, { color: colors.textSecondary }]}>
              REDE: {telemetry.networkType} {telemetry.networkIsConnected ? '[ONLINE]' : '[OFFLINE]'}
            </Text>
          </View>
        </HudCard>

        {/* Core Navigation Modules */}
        <HudCard title="Módulos Centrais">
          <View style={styles.navGrid}>
            <HudButton
              label="[1] ARMAZENAMENTO"
              variant="secondary"
              onPress={() => router.push('/storage')}
            />
            <HudButton
              label="[2] DUPLICADAS"
              variant="secondary"
              onPress={() => router.push('/duplicates')}
            />
            <HudButton
              label="[3] APPS & DEBLOAT"
              variant="secondary"
              onPress={() => router.push('/apps')}
            />
            <HudButton
              label="[4] PERMISSÕES"
              variant="secondary"
              onPress={() => router.push('/onboarding')}
            />
          </View>
        </HudCard>
      </ScrollView>

      {/* Formula Modal explaining 100% open scoring */}
      <Modal visible={showFormulaModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderColor: accentColor }]}>
            <Text style={[styles.modalTitle, { color: accentColor }]}>
              FÓRMULA DE SAÚDE KRNL [0-100]
            </Text>
            <Text style={[styles.modalDesc, { color: colors.textPrimary }]}>
              A nota é calculada localmente sem dados inventados:
            </Text>
            <View style={styles.formulaPoints}>
              <Text style={[styles.formulaItem, { color: colors.textSecondary }]}>
                {`• Armazenamento (35 pts): pontuação baseada em espaço livre real (>25% ideal). Atual: ${health.storageScore}/35 pts`}
              </Text>
              <Text style={[styles.formulaItem, { color: colors.textSecondary }]}>
                {`• Bateria / Temperatura (25 pts): penaliza superaquecimento (>38°C) ou carga crítica. Atual: ${health.batteryScore}/25 pts`}
              </Text>
              <Text style={[styles.formulaItem, { color: colors.textSecondary }]}>
                • Pressão de RAM (20 pts): monitoramento de pressão de memória. Atual: {health.ramHygieneScore}/20 pts
              </Text>
              <Text style={[styles.formulaItem, { color: colors.textSecondary }]}>
                • Segurança do Sistema (20 pts): ADB exposto ou status de conectividade. Atual: {health.securityScore}/20 pts
              </Text>
            </View>

            <View style={styles.divider} />
            <Text style={[styles.diagTitle, { color: colors.textPrimary }]}>DIAGNÓSTICO ATUAL:</Text>
            {health.explanations.map((item, idx) => (
              <Text key={idx} style={[styles.diagLine, { color: accentColor }]}>
                &gt; {item}
              </Text>
            ))}

            <HudButton
              label="FECHAR"
              variant="primary"
              style={{ marginTop: SPACING.md }}
              onPress={() => setShowFormulaModal(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  brandText: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 2,
  },
  subBrand: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
  },
  iconButton: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  iconButtonText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  tapNote: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: SPACING.sm,
  },
  gaugesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  telemetryDetails: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
    paddingTop: SPACING.sm,
  },
  detailLine: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
  navGrid: {
    gap: SPACING.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalBox: {
    borderWidth: 1,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  modalDesc: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: SPACING.md,
  },
  formulaPoints: {
    marginBottom: SPACING.sm,
  },
  formulaItem: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginVertical: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: SPACING.sm,
  },
  diagTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  diagLine: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
});
