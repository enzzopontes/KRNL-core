import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  onSelectNode?: (node: TreemapNode) => void;
}

interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
  node: TreemapNode;
  bg: string;
}

export const SkiaTreemap: React.FC<SkiaTreemapProps> = ({
  nodes,
  width,
  height,
  onSelectNode,
}) => {
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const total = nodes.reduce((acc, n) => acc + n.sizeBytes, 0) || 1;

  // Memoized layout to avoid frame recalculations
  const layoutRects: LayoutRect[] = useMemo(() => {
    const rects: LayoutRect[] = [];
    if (!nodes || nodes.length === 0) return rects;

    // Split top node into hero block, others stacked or split
    let currentY = 0;
    nodes.forEach((node, idx) => {
      const ratio = node.sizeBytes / total;
      const h = Math.max(34, ratio * height);

      const bg = idx === 0 ? 'rgba(255,255,255,0.06)' : idx % 2 === 0 ? colors.surfaceAlt : colors.surfaceMuted;

      rects.push({
        x: 0,
        y: currentY,
        w: width,
        h: Math.min(height - currentY, h),
        node,
        bg,
      });
      currentY += h;
    });

    return rects;
  }, [nodes, total, width, height, colors.surfaceAlt, colors.surfaceMuted]);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  return (
    <View
      style={[styles.container, { width, height, borderColor: colors.border }]}
      accessibilityRole="summary"
      accessibilityLabel={`Mapa de armazenamento com ${nodes.length} categorias.`}
    >
      <Canvas style={{ width, height }}>
        {layoutRects.map((r, i) => (
          <Rect
            key={i}
            x={r.x + 1}
            y={r.y + 1}
            width={r.w - 2}
            height={Math.max(0, r.h - 2)}
            color={r.bg}
          />
        ))}
      </Canvas>

      {/* Overlay Labels & Touch Targets */}
      {layoutRects.map((r, i) => (
        <TouchableOpacity
          key={i}
          activeOpacity={0.7}
          onPress={() => onSelectNode && onSelectNode(r.node)}
          style={[
            styles.labelBlock,
            {
              top: r.y,
              left: r.x,
              width: r.w,
              height: r.h,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.textWrap}>
            <Text numberOfLines={1} style={[styles.nodeTitle, { color: colors.textPrimary }]}>
              {r.node.name.toUpperCase()}
            </Text>
            <Text style={[styles.nodeCategory, { color: colors.textMuted }]}>
              {r.node.category}
            </Text>
          </View>
          <Text style={[styles.nodeSize, { color: i === 0 ? accentColor : colors.textSecondary }]}>
            {formatSize(r.node.sizeBytes)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderWidth: 1,
    overflow: 'hidden',
  },
  labelBlock: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  textWrap: {
    flex: 1,
    marginRight: 8,
  },
  nodeTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nodeCategory: {
    fontSize: 8,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  nodeSize: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});
