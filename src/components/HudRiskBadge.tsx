import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../design/store';

export type RiskLevel = 'RECOMMENDED' | 'ADVANCED' | 'DANGEROUS' | 'CRITICAL' | 'SAFE' | 'UNKNOWN';

interface HudRiskBadgeProps {
  level: RiskLevel;
  label?: string;
}

export const HudRiskBadge: React.FC<HudRiskBadgeProps> = ({ level, label }) => {
  const { getColors } = useThemeStore();
  const colors = getColors();

  const getDetails = () => {
    switch (level) {
      case 'RECOMMENDED':
      case 'SAFE':
        return {
          text: label || 'RECOMENDADO',
          icon: '[✓]',
          color: colors.success,
          border: colors.success,
        };
      case 'ADVANCED':
        return {
          text: label || 'AVANÇADO',
          icon: '[!]',
          color: colors.warning,
          border: colors.warning,
        };
      case 'DANGEROUS':
        return {
          text: label || 'PERIGOSO',
          icon: '[▲]',
          color: colors.danger,
          border: colors.danger,
        };
      case 'CRITICAL':
        return {
          text: label || 'CRÍTICO // BLOQUEADO',
          icon: '[✖]',
          color: colors.danger,
          border: colors.danger,
        };
      default:
        return {
          text: label || 'AUDITAR',
          icon: '[?]',
          color: colors.textSecondary,
          border: colors.borderActive,
        };
    }
  };

  const details = getDetails();

  return (
    <View style={[styles.badge, { borderColor: details.border }]}>
      <Text style={[styles.icon, { color: details.color }]}>{details.icon}</Text>
      <Text style={[styles.text, { color: details.color }]}>{details.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  icon: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '900',
    marginRight: 4,
  },
  text: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
