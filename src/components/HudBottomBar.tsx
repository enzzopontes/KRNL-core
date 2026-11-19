import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { radius, stroke, touch } from '../design/tokens';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'PAINEL', icon: '◫', route: '/(tabs)' },
  { id: 'storage', label: 'LIMPEZA', icon: '⎘', route: '/storage' },
  { id: 'duplicates', label: 'DUPLICADAS', icon: '⧉', route: '/duplicates' },
  { id: 'apps', label: 'APPS', icon: '⊞', route: '/apps' },
  { id: 'settings', label: 'AJUSTES', icon: '⚙', route: '/settings' },
];

export const HudBottomBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor, highContrast } = useThemeStore();
  const colors = getColors();
  const isLight = colors.background !== '#000000';
  const effectiveAccent = isLight && (accentColor === '#FFFFFF' || accentColor.toLowerCase() === '#fff') ? colors.textPrimary : accentColor;

  const isCurrent = (route: string) => {
    if (route === '/(tabs)' && (pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index')) {
      return true;
    }
    return pathname.startsWith(route);
  };

  const activePillBg = effectiveAccent === '#FFFFFF' ? 'rgba(255, 255, 255, 0.08)' : `${effectiveAccent}15`;

  return (
    <View
      style={[
        styles.barContainer,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: highContrast ? stroke.strong : stroke.hairline,
          paddingBottom: Math.max(insets.bottom, 6),
        },
      ]}
    >
      <View style={styles.itemsRow}>
        {NAV_ITEMS.map((item) => {
          const active = isCurrent(item.route);
          return (
            <TouchableOpacity
              key={item.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Aba ${item.label}`}
              activeOpacity={0.7}
              onPress={() => {
                if (!active) {
                  router.replace(item.route as any);
                }
              }}
              style={[
                styles.navButton,
                active && { backgroundColor: activePillBg },
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  {
                    color: active ? effectiveAccent : colors.textMuted,
                    opacity: active ? 1 : 0.6,
                  },
                ]}
              >
                {item.icon}
              </Text>
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: active ? effectiveAccent : colors.textMuted,
                    opacity: active ? 1 : 0.6,
                    fontWeight: active ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  itemsRow: {
    flexDirection: 'row',
    height: touch.min + 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    paddingTop: 4,
  },
  navButton: {
    flex: 1,
    height: touch.min,
    marginHorizontal: 2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
