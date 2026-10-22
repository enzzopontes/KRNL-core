import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { useThemeStore } from '../design/store';

export interface TreemapNode {
  name: string;
  sizeBytes: number;
  category: string;
  color?: string;
}

interface SkiaTreemapProps {
  nodes: TreemapNode[];
  width: number;
  height: number;
}

interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
  node: TreemapNode;
}

export const SkiaTreemap: React.FC<SkiaTreemapProps> = ({ nodes, width, height }) => {
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const total = nodes.reduce((acc, n) => acc + n.sizeBytes, 0) || 1;

  // Squarified / slice-and-dice layout for HUD Treemap
  const layoutRects: LayoutRect[] = [];
  let currentY = 0;

  nodes.forEach((node, idx) => {
    const ratio = node.sizeBytes / total;
    const h = Math.max(28, ratio * height);

    layoutRects.push({
      x: 0,
      y: currentY,
      w: width,
      h: Math.min(height - currentY, h),
      node,
    });
    currentY += h;
  });

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={{ width, height }}>
        {layoutRects.map((r, i) => (
          <Rect
            key={i}
            x={r.x + 1}
            y={r.y + 1}
            width={r.w - 2}
            height={r.h - 2}
            color={i % 2 === 0 ? colors.surfaceAlt : colors.surfaceMuted}
          />
        ))}
      </Canvas>

      {/* Overlay Labels */}
      {layoutRects.map((r, i) => (
        <View
          key={i}
          style={[
            styles.labelBlock,
            {
              top: r.y,
              left: r.x,
              width: r.w,
              height: r.h,
              borderColor: colors.border,
            },
          ]}
        >
          <Text numberOfLines={1} style={[styles.nodeTitle, { color: colors.textPrimary }]}>
            {r.node.name.toUpperCase()}
          </Text>
          <Text style={[styles.nodeSize, { color: accentColor }]}>
            {formatSize(r.node.sizeBytes)}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    marginVertical: 8,
  },
  labelBlock: {
    position: 'absolute',
    borderWidth: 1,
    padding: 4,
    justifyContent: 'center',
  },
  nodeTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  nodeSize: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
