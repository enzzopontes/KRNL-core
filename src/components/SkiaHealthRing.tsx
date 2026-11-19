import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useThemeStore } from '../design/store';

interface SkiaHealthRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const SkiaHealthRing: React.FC<SkiaHealthRingProps> = ({
  score,
  size = 190,
  strokeWidth = 10,
  label = 'SYS.HEALTH',
}) => {
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();
  const isLight = colors.background !== '#000000';
  const effectiveAccent = isLight && (accentColor === '#FFFFFF' || accentColor.toLowerCase() === '#fff') ? colors.textPrimary : accentColor;

  const clampedScore = Math.max(0, Math.min(100, score));

  // 270 degree arc: starts at 135° (bottom left) and sweeps 270° to 45° (bottom right)
  const START_ANGLE = 135;
  const TOTAL_ARC = 270;
  const sweepAngle = (clampedScore / 100) * TOTAL_ARC;

  const radius = (size - strokeWidth * 2.2) / 2;
  const center = size / 2;

  // Memoize Skia paths to prevent GC frame drops (Per Skia Performance Rules)
  const { bgPath, activePath, ticksPath, innerTrackPath } = useMemo(() => {
    const oval = {
      x: center - radius,
      y: center - radius,
      width: radius * 2,
      height: radius * 2,
    };

    // 1. Background 270° track
    const bgP = Skia.Path.Make();
    bgP.addArc(oval, START_ANGLE, TOTAL_ARC);

    // 2. Active 270° progress arc
    const actP = Skia.Path.Make();
    if (sweepAngle > 0) {
      actP.addArc(oval, START_ANGLE, sweepAngle);
    }

    // 3. Inner faint decorative technical circle
    const innerR = radius - strokeWidth * 1.5;
    const innerP = Skia.Path.Make();
    const innerOval = {
      x: center - innerR,
      y: center - innerR,
      width: innerR * 2,
      height: innerR * 2,
    };
    innerP.addArc(innerOval, START_ANGLE, TOTAL_ARC);

    // 4. Combined ticks path: SINGLE Path for delicate precision micro-ticks (atlas/batching rule)
    const tP = Skia.Path.Make();
    const tickCount = 36;
    const tickR1 = radius - strokeWidth * 0.9;
    const tickR2 = radius - strokeWidth * 1.25;

    for (let i = 0; i <= tickCount; i++) {
      const angleDeg = START_ANGLE + (i / tickCount) * TOTAL_ARC;
      const rad = (angleDeg * Math.PI) / 180;
      const x1 = center + tickR1 * Math.cos(rad);
      const y1 = center + tickR1 * Math.sin(rad);
      const x2 = center + tickR2 * Math.cos(rad);
      const y2 = center + tickR2 * Math.sin(rad);

      tP.moveTo(x1, y1);
      tP.lineTo(x2, y2);
    }

    return {
      bgPath: bgP,
      activePath: actP,
      ticksPath: tP,
      innerTrackPath: innerP,
    };
  }, [center, radius, strokeWidth, sweepAngle]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        {/* Background Track (270°) */}
        <Path
          path={bgPath}
          color={colors.border}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
        />

        {/* Inner Precision Track */}
        <Path
          path={innerTrackPath}
          color={colors.border}
          style="stroke"
          strokeWidth={1}
          opacity={0.25}
        />

        {/* Precision Micro-ticks in Single Path */}
        <Path
          path={ticksPath}
          color={colors.textSecondary}
          style="stroke"
          strokeWidth={1}
          strokeCap="round"
          opacity={0.25}
        />

        {/* Active Progress Arc */}
        <Path
          path={activePath}
          color={effectiveAccent}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
        />
      </Canvas>

      {/* Center Readout HUD Metric */}
      <View style={styles.overlay}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text
          style={[styles.scoreText, { color: colors.textPrimary }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {Math.round(clampedScore)}
        </Text>
        <View
          style={[
            styles.ptsBadge,
            {
              backgroundColor: effectiveAccent === '#FFFFFF' ? 'rgba(255, 255, 255, 0.08)' : `${effectiveAccent}15`,
              borderColor: effectiveAccent === '#FFFFFF' ? 'rgba(255, 255, 255, 0.15)' : `${effectiveAccent}30`,
            },
          ]}
        >
          <Text style={[styles.ptsLabel, { color: effectiveAccent }]}>/ 100 PTS</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  overlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
    lineHeight: 56,
  },
  ptsBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ptsLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
});
