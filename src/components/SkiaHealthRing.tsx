import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useThemeStore } from '../design/store';

interface SkiaHealthRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
}

export const SkiaHealthRing: React.FC<SkiaHealthRingProps> = ({
  score,
  size = 180,
  strokeWidth = 10,
}) => {
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Background circle path
  const bgPath = Skia.Path.Make();
  bgPath.addCircle(center, center, radius);

  // Active arc path (starts at -90 deg / 12 o'clock)
  const clampedScore = Math.max(0, Math.min(100, score));
  const sweepAngle = (clampedScore / 100) * 360;

  const activePath = Skia.Path.Make();
  const oval = {
    x: center - radius,
    y: center - radius,
    width: radius * 2,
    height: radius * 2,
  };
  activePath.addArc(oval, -90, sweepAngle);

  // Tick marks around ring for HUD aesthetic
  const ticks = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const innerR = radius - strokeWidth * 0.9;
    const outerR = radius - strokeWidth * 0.4;
    return {
      x1: center + innerR * Math.cos(angle),
      y1: center + innerR * Math.sin(angle),
      x2: center + outerR * Math.cos(angle),
      y2: center + outerR * Math.sin(angle),
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        {/* Background Track */}
        <Path
          path={bgPath}
          color={colors.border}
          style="stroke"
          strokeWidth={strokeWidth}
        />
        {/* Active Arc */}
        <Path
          path={activePath}
          color={accentColor}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="square"
        />
        {/* HUD Ticks */}
        {ticks.map((tick, idx) => {
          const tPath = Skia.Path.Make();
          tPath.moveTo(tick.x1, tick.y1);
          tPath.lineTo(tick.x2, tick.y2);
          return (
            <Path
              key={idx}
              path={tPath}
              color={colors.borderActive}
              style="stroke"
              strokeWidth={1}
            />
          );
        })}
      </Canvas>
      <View style={styles.overlay}>
        <Text style={[styles.scoreText, { color: colors.textPrimary }]}>
          {Math.round(clampedScore)}
        </Text>
        <Text style={[styles.labelText, { color: accentColor }]}>HEALTH // INDEX</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
    marginVertical: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: -1,
  },
  labelText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },
});
