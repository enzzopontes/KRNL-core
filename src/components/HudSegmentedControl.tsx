import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../design/store';
import { SPACING, touch } from '../design/tokens';

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  badge?: string;
}

interface HudSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
}

export function HudSegmentedControl<T extends string>({
  options,
  selectedId,
  onSelect,
}: HudSegmentedControlProps<T>) {
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const isLightAccent = (color: string) => {
    const hex = color.replace('#', '');
    if (hex.length !== 6) return true;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const selectedTextColor = isLightAccent(accentColor) ? '#000000' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        return (
          <TouchableOpacity
            key={opt.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={opt.label}
            activeOpacity={0.8}
            onPress={() => onSelect(opt.id)}
            style={[
              styles.tab,
              isSelected && {
                backgroundColor: accentColor,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? selectedTextColor : colors.textSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {opt.label.toUpperCase()}
            </Text>
            {opt.badge && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isSelected ? selectedTextColor : colors.surfaceAlt,
                    borderColor: isSelected ? selectedTextColor : colors.borderActive,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: isSelected ? (selectedTextColor === '#000000' ? '#FFFFFF' : '#000000') : colors.textPrimary },
                  ]}
                >
                  {opt.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    marginVertical: SPACING.sm,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    minHeight: touch.min - 10,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
});
