import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Skia, Circle } from '@shopify/react-native-skia';
import { useThemeStore } from '../design/store';
import { SPACING } from '../design/tokens';

interface HudWaveSparklineProps {
  data?: number[];
  height?: number;
  highlightIndex?: number;
  label?: string;
  tag?: string;
}

export const HudWaveSparkline: React.FC<HudWaveSparklineProps> = ({
  data = [42, 55, 48, 68, 60, 75, 72, 84, 78, 88],
  height = 90,
  highlightIndex = 7,
  label = 'HISTÓRICO DE ESTABILIDADE',
  tag = '+14.2% OPT',
}) => {
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const { linePath, areaPath, activeDot } = useMemo(() => {
    const width = 300;
    const paddingX = 10;
    const paddingY = 12;
    const graphW = width - paddingX * 2;
    const graphH = height - paddingY * 2;

    const points = data.map((val, idx) => {
      const x = paddingX + (idx / (data.length - 1)) * graphW;
      const normalizedY = (val - min) / range;
      const y = height - paddingY - normalizedY * graphH;
      return { x, y };
    });

    const lP = Skia.Path.Make();
    const aP = Skia.Path.Make();

    if (points.length > 0) {
      lP.moveTo(points[0].x, points[0].y);
      aP.moveTo(points[0].x, height - paddingY);
      aP.lineTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cx = (p0.x + p1.x) / 2;
        lP.cubicTo(cx, p0.y, cx, p1.y, p1.x, p1.y);
        aP.cubicTo(cx, p0.y, cx, p1.y, p1.x, p1.y);
      }

      const lastP = points[points.length - 1];
      aP.lineTo(lastP.x, height - paddingY);
      aP.close();
    }

    const hlIdx = Math.max(0, Math.min(points.length - 1, highlightIndex));
    const dot = points[hlIdx] || { x: 0, y: 0 };

    return {
      linePath: lP,
      areaPath: aP,
      activeDot: dot,
    };
  }, [data, height, min, range, highlightIndex]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>
        <Text style={[styles.tag, { color: accentColor }]}>{tag}</Text>
      </View>

      <View style={{ height, width: '100%', alignItems: 'center' }}>
        <Canvas style={{ width: 300, height }}>
          {/* Faint subtle grid reference lines */}
          <Path
            path={Skia.Path.Make().moveTo(10, height / 2).lineTo(290, height / 2)}
            color={colors.border}
            style="stroke"
            strokeWidth={1}
            opacity={0.4}
          />
          {/* Area under wave */}
          <Path
            path={areaPath}
            color={accentColor}
            style="fill"
            opacity={0.08}
          />
          {/* Smooth wave line */}
          <Path
            path={linePath}
            color={accentColor}
            style="stroke"
            strokeWidth={2}
          />
          {/* Active highlighted telemetry dot */}
          <Circle
            cx={activeDot.x}
            cy={activeDot.y}
            r={5}
            color={accentColor}
          />
          <Circle
            cx={activeDot.x}
            cy={activeDot.y}
            r={2}
            color="#000000"
          />
        </Canvas>
      </View>

      <View style={styles.footerRow}>
        <Text style={[styles.footNote, { color: colors.textMuted }]}>T-60m</Text>
        <Text style={[styles.footNote, { color: colors.textMuted }]}>AMOSTRAGEM 1Hz</Text>
        <Text style={[styles.footNote, { color: colors.textMuted }]}>AGORA</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
    marginBottom: 4,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tag: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    marginTop: 2,
  },
  footNote: {
    fontSize: 8,
    fontFamily: 'monospace',
  },
});
