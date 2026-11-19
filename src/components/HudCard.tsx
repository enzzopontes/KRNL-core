import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../design/store';
import { SPACING, stroke, radius } from '../design/tokens';

interface HudCardProps {
  title?: string;
  badge?: string;
  badgeVariant?: 'default' | 'accent' | 'danger' | 'warning' | 'ok';
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  highlight?: boolean;
}

export const HudCard: React.FC<HudCardProps> = ({
  title,
  badge,
  badgeVariant = 'default',
  subtitle,
  children,
  style,
  contentStyle,
  highlight = false,
}) => {
  const { getColors, accentColor, highContrast } = useThemeStore();
  const colors = getColors();

  const borderWidth = highContrast ? stroke.strong : stroke.hairline;

  const getBadgeColor = () => {
    switch (badgeVariant) {
      case 'accent':
        return accentColor;
      case 'danger':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'ok':
        return colors.success;
      default:
        return highlight ? accentColor : colors.textSecondary;
    }
  };

  const badgeColor = getBadgeColor();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: highlight ? (colors.background === '#000000' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : colors.surface,
          borderColor: highlight ? accentColor : colors.border,
          borderWidth,
        },
        style,
      ]}
    >
      {(title || badge) && (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.titleWrap}>
            {title && (
              <Text
                style={[
                  styles.title,
                  { color: highlight ? accentColor : colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          {badge && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: badgeColor.length === 7 ? `${badgeColor}18` : badgeColor,
                  borderColor: badgeColor.length === 7 ? `${badgeColor}30` : badgeColor,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: badgeColor }]}>
                {badge}
              </Text>
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
    position: 'relative',
    marginVertical: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  titleWrap: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  body: {
    width: '100%',
  },
});
