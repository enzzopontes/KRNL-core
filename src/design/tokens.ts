export const ACCENT_PRESETS = [
  { name: 'Branco Puro', hex: '#FFFFFF' },
  { name: 'Ciano Neon', hex: '#00F0FF' },
  { name: 'Verde Terminal', hex: '#00FF66' },
  { name: 'Vermelho Alerta', hex: '#FF2A4D' },
  { name: 'Âmbar KRNL', hex: '#FFB800' },
  { name: 'Roxo Quântico', hex: '#A855F7' },
] as const;

export type AccentPresetHex = (typeof ACCENT_PRESETS)[number]['hex'];

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
  background: '#000000',
  surface: '#0A0A0A',
  surfaceAlt: '#121212',
  surfaceMuted: '#181818',
  border: '#1F1F1F',
  borderActive: '#333333',
  textPrimary: '#FFFFFF',
  textSecondary: '#8A8A8A',
  textMuted: '#525252',
  danger: '#FF2A4D',
  warning: '#FFB800',
  success: '#00FF66',
  glowOpacity: 0.35,
};

export const LIGHT_THEME: ColorTheme = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceAlt: '#EAEAEA',
  surfaceMuted: '#D8D8D8',
  border: '#D0D0D0',
  borderActive: '#A0A0A0',
  textPrimary: '#000000',
  textSecondary: '#555555',
  textMuted: '#888888',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#16A34A',
  glowOpacity: 0.15,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const TYPOGRAPHY = {
  mono: 'JetBrainsMono',
  sans: 'Inter',
};
