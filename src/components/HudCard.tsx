import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useThemeStore } from '../design/store';
import { SPACING } from '../design/tokens';

interface HudCardProps {
  title?: string;
  badge?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  highlight?: boolean;
}

export const HudCard: React.FC<HudCardProps> = ({
  title,
  badge,
  children,
  style,
  contentStyle,
  highlight = false,
}) => {
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: highlight ? accentColor : colors.border,
        },
        style,
      ]}
    >
      {/* HUD corner notches / technical markings */}
      <View style={[styles.cornerTL, { borderColor: highlight ? accentColor : colors.borderActive }]} />
      <View style={[styles.cornerBR, { borderColor: highlight ? accentColor : colors.borderActive }]} />

      {(title || badge) && (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          {title && (
            <Text style={[styles.title, { color: colors.textSecondary }]}>
              {title.toUpperCase()}
            </Text>
          )}
          {badge && (
            <View style={[styles.badge, { borderColor: accentColor }]}>
              <Text style={[styles.badgeText, { color: accentColor }]}>{badge}</Text>
            </View>
          )}
        </View>
      )}
      <View style={[styles.body, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    position: 'relative',
    marginVertical: SPACING.sm,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  body: {
    position: 'relative',
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
