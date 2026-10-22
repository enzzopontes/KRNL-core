import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useThemeStore } from '../design/store';

interface SkiaMiniGaugeProps {
  label: string;
  value: number; // 0 to 100
  unit?: string;
  customColor?: string;
  width?: number;
  height?: number;
}

export const SkiaMiniGauge: React.FC<SkiaMiniGaugeProps> = ({
  label,
  value,
  unit = '%',
  customColor,
  width = 140,
  height = 70,
}) => {
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();
  const activeColor = customColor || accentColor;

  const strokeWidth = 6;
  const radius = width / 2 - strokeWidth;
  const cx = width / 2;
  const cy = height; // semi circle sitting on bottom

  const clamped = Math.max(0, Math.min(100, value));
  // 180 degrees arc from 180 (left) to 0 (right)
  const sweepAngle = (clamped / 100) * 180;

  const bgPath = Skia.Path.Make();
  const oval = {
    x: cx - radius,
    y: cy - radius,
    width: radius * 2,
    height: radius * 2,
  };
  bgPath.addArc(oval, 180, 180);

  const activePath = Skia.Path.Make();
  activePath.addArc(oval, 180, sweepAngle);

  return (
    <View style={[styles.container, { width, height: height + 24 }]}>
      <Canvas style={{ width, height }}>
        <Path
          path={bgPath}
          color={colors.border}
          style="stroke"
          strokeWidth={strokeWidth}
        />
        <Path
          path={activePath}
          color={activeColor}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="square"
        />
      </Canvas>
      <View style={[styles.overlay, { top: cy - 26 }]}>
        <Text style={[styles.valText, { color: colors.textPrimary }]}>
          {Math.round(clamped)}
          <Text style={[styles.unitText, { color: colors.textSecondary }]}>{unit}</Text>
        </Text>
        <Text style={[styles.lblText, { color: activeColor }]}>{label.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  overlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  valText: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  unitText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  lblText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 2,
  },
});
