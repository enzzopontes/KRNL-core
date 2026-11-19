import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useThemeStore } from '../design/store';

interface SkiaMiniGaugeProps {
  label: string;
  value: number; // 0 to 100
  unit?: string;
  trend?: string;
  customColor?: string;
  width?: number;
  height?: number;
}

export const SkiaMiniGauge: React.FC<SkiaMiniGaugeProps> = ({
  label,
  value,
  unit = '%',
  trend,
  customColor,
  width = 150,
  height = 80,
}) => {
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();
  const activeColor = customColor || accentColor;

  const clamped = Math.max(0, Math.min(100, value));

  const strokeWidth = 5;
  const radius = width / 2 - strokeWidth * 2;
  const cx = width / 2;
  const cy = height - 10;

  const { bgPath, activePath, ticksPath } = useMemo(() => {
    const oval = {
      x: cx - radius,
      y: cy - radius,
      width: radius * 2,
      height: radius * 2,
    };

    // 180 degree arc: from 180 (left) to 0 (right)
    const bgP = Skia.Path.Make();
    bgP.addArc(oval, 180, 180);

    const actP = Skia.Path.Make();
    const sweepAngle = (clamped / 100) * 180;
    if (sweepAngle > 0) {
      actP.addArc(oval, 180, sweepAngle);
    }

    // Ticks: single path
    const tP = Skia.Path.Make();
    const tickCount = 9;
    const r1 = radius + strokeWidth * 0.8;
    const r2 = radius + strokeWidth * 1.6;

    for (let i = 0; i <= tickCount; i++) {
      const angleDeg = 180 + (i / tickCount) * 180;
      const rad = (angleDeg * Math.PI) / 180;
      const x1 = cx + r1 * Math.cos(rad);
      const y1 = cy + r1 * Math.sin(rad);
      const x2 = cx + r2 * Math.cos(rad);
      const y2 = cy + r2 * Math.sin(rad);

      tP.moveTo(x1, y1);
      tP.lineTo(x2, y2);
    }

    return {
      bgPath: bgP,
      activePath: actP,
      ticksPath: tP,
    };
  }, [cx, cy, radius, clamped, strokeWidth]);

  return (
    <View
      style={[styles.container, { width, height: height + 28 }]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${Math.round(clamped)}${unit}${trend ? `, ${trend}` : ''}`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <Canvas style={{ width, height }}>
        <Path
          path={bgPath}
          color={colors.border}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
        />
        <Path
          path={ticksPath}
          color={colors.borderActive}
          style="stroke"
          strokeWidth={1}
          opacity={0.25}
        />
        <Path
          path={activePath}
          color={activeColor}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
        />
      </Canvas>

      <View style={[styles.overlay, { top: cy - 22 }]}>
        <Text style={[styles.valText, { color: colors.textPrimary }]}>
          {Math.round(clamped)}
          <Text style={[styles.unitText, { color: colors.textSecondary }]}>{unit}</Text>
        </Text>
        <Text style={[styles.lblText, { color: colors.textSecondary }]}>{label}</Text>
        {trend && (
          <Text style={[styles.trendText, { color: colors.textMuted }]}>{trend}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 4,
  },
  overlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  valText: {
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lblText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
});
