import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { useThemeStore } from '../design/store';
import { SPACING } from '../design/tokens';

interface HudButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
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
}) => {
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceMuted;
    if (variant === 'primary') return accentColor;
    if (variant === 'danger') return colors.danger;
    if (variant === 'ghost') return 'transparent';
    return colors.surface;
  };

  const getBorderColor = () => {
    if (disabled) return colors.border;
    if (variant === 'primary') return accentColor;
    if (variant === 'danger') return colors.danger;
    if (variant === 'ghost') return 'transparent';
    return colors.borderActive;
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (variant === 'primary') {
      // If accent is white or light, text is black
      return accentColor.toLowerCase() === '#ffffff' ? '#000000' : '#000000';
    }
    if (variant === 'danger') return '#FFFFFF';
    return colors.textPrimary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
              },
              textStyle,
            ]}
          >
            {label.toUpperCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    paddingVertical: SPACING.md - 2,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  text: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
