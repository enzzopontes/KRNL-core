export const appSignature = 'KRNL // CORE';
export const appName = 'KRNL Core';
export const appVersion = '1.0.0';

export const palette = {
  bg: '#000000',        // AMOLED, fundo de tela
  surface1: '#0A0A0A',  // cartões
  surface2: '#15171C',  // cartões elevados, modais
  surface3: '#1E2128',  // elementos flutuantes / tabs
  border: '#1F1F1F',    // linhas de 1 px decorativas
  borderStrong: '#333333', // linhas de 1 px interativas
  text: '#F4F4F6',
  textMuted: '#9CA3AF', // secundário
  textDim: '#52525B',   // rótulos secundários terciários
} as const;

export const accents = {
  white: '#FFFFFF', // padrão
  cyan: '#22D3EE',
  green: '#10B981',
  red: '#EF4444',
  amber: '#F59E0B',
  purple: '#A855F7',
} as const;

export const ACCENT_PRESETS = [
  { name: 'Branco Puro', hex: '#FFFFFF' },
  { name: 'Ciano HUD', hex: '#22D3EE' },
  { name: 'Verde Matrix', hex: '#10B981' },
  { name: 'Vermelho Alerta', hex: '#EF4444' },
  { name: 'Âmbar KRNL', hex: '#F59E0B' },
  { name: 'Roxo Quântico', hex: '#A855F7' },
] as const;

export type AccentPresetHex = (typeof ACCENT_PRESETS)[number]['hex'];

export const semantic = {
  danger: '#F87171',   // ação destrutiva, risco Perigoso/Crítico
  warning: '#F59E0B',  // risco Avançado
  ok: '#4ADE80',       // risco Recomendado, concluído
  info: '#00F0FF',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const SPACING = space;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  chamfer: 14,
  card: 20,
  pill: 999,
} as const;

export const stroke = {
  hairline: 1,
  strong: 2,
} as const;

export const touch = {
  min: 48,
} as const;

export interface ColorTheme {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceMuted: string;
  border: string;
  borderActive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
  warning: string;
  success: string;
  glowOpacity: number;
}

export const AMOLED_THEME: ColorTheme = {
  background: palette.bg,
  surface: palette.surface1,
  surfaceAlt: palette.surface2,
  surfaceMuted: palette.surface3,
  border: palette.border,
  borderActive: palette.borderStrong,
  textPrimary: palette.text,
  textSecondary: palette.textMuted,
  textMuted: palette.textDim,
  danger: semantic.danger,
  warning: semantic.warning,
  success: semantic.ok,
  glowOpacity: 0.35,
};

export const LIGHT_THEME: ColorTheme = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceAlt: '#EAEAEA',
  surfaceMuted: '#D8D8D8',
  border: '#D4D4D4',
  borderActive: '#A0A0A0',
  textPrimary: '#000000',
  textSecondary: '#5F5F5F',
  textMuted: '#888888',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#16A34A',
  glowOpacity: 0.15,
};

export const TYPOGRAPHY = {
  mono: 'JetBrainsMono',
  sans: 'Inter',
};
