import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { useThemeStore } from '../design/store';
import { SPACING, stroke, touch, radius } from '../design/tokens';

interface HudButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'pill';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const HudButton: React.FC<HudButtonProps> = ({
  label,
  onPress,
  variant = 'secondary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  subtitle,
}) => {
  const { getColors, accentColor, highContrast } = useThemeStore();
  const colors = getColors();
  const [isPressed, setIsPressed] = useState(false);

  const borderWidth = highContrast ? stroke.strong : stroke.hairline;

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return colors.surfaceMuted;

    if (variant === 'primary') {
      return accentColor;
    }
    if (variant === 'danger') {
      return pressed ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.12)';
    }
    if (variant === 'ghost') {
      return pressed ? colors.surfaceAlt : 'transparent';
    }
    if (variant === 'pill') {
      return pressed ? colors.surfaceMuted : colors.surfaceAlt;
    }
    // secondary
    return pressed ? colors.surfaceMuted : colors.surfaceAlt;
  };

  const getBorderColor = () => {
    if (disabled) return colors.border;
    if (variant === 'primary') return accentColor;
    if (variant === 'danger') return 'rgba(239, 68, 68, 0.35)';
    if (variant === 'ghost') return 'transparent';
    if (variant === 'pill') return colors.borderActive;
    return colors.borderActive;
  };

  const getTextColor = (pressed: boolean) => {
    if (disabled) return colors.textMuted;

    if (variant === 'primary') {
      const isLightAccent =
        accentColor === '#FFFFFF' ||
        accentColor.toUpperCase() === '#FFF' ||
        accentColor === '#FBBF24' ||
        accentColor === '#F59E0B' ||
        accentColor === '#4ADE80' ||
        accentColor === '#10B981' ||
        accentColor === '#22D3EE' ||
        accentColor === '#00F0FF';
      return isLightAccent ? '#000000' : '#FFFFFF';
    }
    if (variant === 'danger') {
      return colors.danger;
    }
    return colors.textPrimary;
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      accessibilityLabel={`${label}${subtitle ? ` - ${subtitle}` : ''}`}
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: touch.min,
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth,
          borderRadius: variant === 'pill' ? radius.pill : radius.md,
          opacity: disabled ? 0.45 : pressed && variant === 'primary' ? 0.88 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor(isPressed)} />
      ) : (
        <View style={styles.contentWrap}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.textWrap}>
            <Text
              style={[
                styles.label,
                {
                  color: getTextColor(isPressed),
                },
                textStyle,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color:
                      variant === 'primary'
                        ? getTextColor(isPressed) === '#000000'
                          ? 'rgba(0, 0, 0, 0.7)'
                          : 'rgba(255, 255, 255, 0.7)'
                        : colors.textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginVertical: SPACING.xs,
    position: 'relative',
  },
  contentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  textWrap: {
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});
