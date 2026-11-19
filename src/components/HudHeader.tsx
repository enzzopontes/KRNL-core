import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../design/store';
import { SPACING, appSignature, radius } from '../design/tokens';
import { useTelemetryStore } from '../services/telemetryStore';

interface HudHeaderProps {
  showBack?: boolean;
  title?: string;
  subtitle?: string;
}

export const HudHeader: React.FC<HudHeaderProps> = ({
  showBack = false,
  title,
  subtitle,
}) => {
  const router = useRouter();
  const { getColors, accentColor, isPro } = useThemeStore();
  const colors = getColors();
  const { telemetry } = useTelemetryStore();

  const isLight = colors.background !== '#000000';
  const effectiveAccent =
    isLight && (accentColor === '#FFFFFF' || accentColor.toLowerCase() === '#fff')
      ? colors.textPrimary
      : accentColor;

  return (
    <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
      <View style={styles.mainRow}>
        {showBack ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar ao Painel Principal"
            style={[styles.backBtn, { borderColor: colors.borderActive, backgroundColor: colors.surfaceAlt }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backText, { color: effectiveAccent }]}>←</Text>
            <Text style={[styles.backLabel, { color: colors.textPrimary }]}>Voltar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandContainer}>
            <View style={styles.brandTitleRow}>
              <View style={[styles.statusDot, { backgroundColor: effectiveAccent }]} />
              <Text style={[styles.brandPrefix, { color: colors.textPrimary }]}>KRNL</Text>
              <Text style={[styles.brandDot, { color: effectiveAccent }]}>·</Text>
              <Text style={[styles.brandSuffix, { color: effectiveAccent }]}>CORE</Text>
            </View>
            <Text style={[styles.subText, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle || `SYS.VER 1.0.0 · ANDROID ${telemetry.androidVersion || '12+'}`}
            </Text>
          </View>
        )}

        {showBack && (
          <View style={styles.centerInfo}>
            <Text style={[styles.titleText, { color: effectiveAccent }]} numberOfLines={1}>
              {title || appSignature}
            </Text>
            <Text style={[styles.subText, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle || 'AUDITORIA NATIVA'}
            </Text>
          </View>
        )}

        <View style={styles.rightActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Licença do Sistema"
            style={[
              styles.proBadge,
              {
                borderColor: isPro
                  ? colors.success
                  : isLight
                  ? colors.borderActive
                  : 'rgba(255, 255, 255, 0.15)',
                backgroundColor: isPro
                  ? 'rgba(74, 222, 128, 0.12)'
                  : isLight
                  ? colors.surfaceAlt
                  : 'rgba(255, 255, 255, 0.05)',
              },
            ]}
            onPress={() => router.push('/subscription')}
          >
            <Text
              style={[
                styles.proBadgeText,
                { color: isPro ? colors.success : effectiveAccent },
              ]}
            >
              {isPro ? 'PRO' : 'FREE'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Abrir Configurações e Personalização"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.cfgButton,
              {
                borderColor: colors.borderActive,
                backgroundColor: colors.surfaceAlt,
              },
            ]}
            onPress={() => router.push('/settings')}
          >
            <Text style={[styles.cfgIcon, { color: colors.textPrimary }]}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    position: 'relative',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
  },
  brandContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  brandPrefix: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandDot: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 1,
  },
  brandSuffix: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backBtn: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  backLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  centerInfo: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subText: {
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cfgButton: {
    borderWidth: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cfgIcon: {
    fontSize: 14,
    textAlign: 'center',
  },
});
