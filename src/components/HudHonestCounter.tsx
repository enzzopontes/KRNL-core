import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../design/store';
import { SPACING } from '../design/tokens';

interface HudHonestCounterProps {
  inTrashBytes: number;
  freedBytes: number;
  quarantinedCount?: number;
}

export const HudHonestCounter: React.FC<HudHonestCounterProps> = ({
  inTrashBytes,
  freedBytes,
  quarantinedCount = 0,
}) => {
  const { getColors } = useThemeStore();
  const colors = getColors();

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return { val: (bytes / (1024 * 1024 * 1024)).toFixed(2), unit: 'GB' };
    }
    return { val: (bytes / (1024 * 1024)).toFixed(1), unit: 'MB' };
  };

  const trashFormatted = formatSize(inTrashBytes);
  const freedFormatted = formatSize(freedBytes);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* HUD corner lines */}
      <View style={[styles.cornerTL, { borderColor: colors.borderActive }]} />
      <View style={[styles.cornerBR, { borderColor: colors.borderActive }]} />

      <View style={styles.titleRow}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          CONTABILIDADE TRANSPARENTE
        </Text>
        <Text style={[styles.ruleNote, { color: colors.textMuted }]}>
          [ REGRA: LIBERADO SÓ APÓS ESVAZIAR ]
        </Text>
      </View>

      <View style={styles.metricsRow}>
        {/* Metric 1: Na Lixeira */}
        <View style={[styles.metricCol, { borderRightColor: colors.border, borderRightWidth: 1 }]}>
          <Text style={[styles.metricLabel, { color: colors.warning }]}>
            ● NA LIXEIRA (QUARENTENA)
          </Text>
          <View style={styles.valueRow}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {trashFormatted.val}
            </Text>
            <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>
              {trashFormatted.unit}
            </Text>
          </View>
          <Text style={[styles.subNote, { color: colors.textMuted }]}>
            {quarantinedCount > 0 ? `${quarantinedCount} itens isolados` : 'Quarentena reversível'}
          </Text>
        </View>

        {/* Metric 2: Liberado Efetivamente */}
        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: colors.success }]}>
            ✓ LIBERADO REAL
          </Text>
          <View style={styles.valueRow}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {freedFormatted.val}
            </Text>
            <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>
              {freedFormatted.unit}
            </Text>
          </View>
          <Text style={[styles.subNote, { color: colors.textMuted }]}>
            Espaço físico recuperado
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    position: 'relative',
    borderRadius: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  ruleNote: {
    fontSize: 8,
    fontFamily: 'monospace',
  },
  metricsRow: {
    flexDirection: 'row',
  },
  metricCol: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricVal: {
    fontSize: 26,
    fontFamily: 'monospace',
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  metricUnit: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginLeft: 4,
  },
  subNote: {
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  cornerTL: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 6,
    height: 6,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});
