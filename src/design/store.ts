import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import { AMOLED_THEME, ColorTheme, LIGHT_THEME } from './tokens';

// Initialize MMKV storage instance
export const mmkv = createMMKV({ id: 'krnl-settings' });

const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    mmkv.remove(name);
  },
};

export type ThemeMode = 'amoled' | 'light' | 'auto';
export type HudDensity = 'compact' | 'normal' | 'expanded';

export interface ThemeState {
  themeMode: ThemeMode;
  accentColor: string;
  glowIntensity: number; // 0 to 1
  hudDensity: HudDensity;
  reduceMotion: boolean;
  highContrast: boolean;
  expertMode: boolean;
  isPro: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (hex: string) => void;
  setGlowIntensity: (val: number) => void;
  setHudDensity: (density: HudDensity) => void;
  setReduceMotion: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setExpertMode: (val: boolean) => void;
  setIsPro: (val: boolean) => void;

  // Helpers
  getColors: () => ColorTheme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'amoled',
      accentColor: '#FFFFFF',
      glowIntensity: 0.5,
      hudDensity: 'normal',
      reduceMotion: false,
      highContrast: false,
      expertMode: false,
      isPro: false,

      setThemeMode: (mode) => set({ themeMode: mode }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setGlowIntensity: (glowIntensity) => set({ glowIntensity }),
      setHudDensity: (hudDensity) => set({ hudDensity }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setExpertMode: (expertMode) => set({ expertMode }),
      setIsPro: (isPro) => set({ isPro }),

      getColors: () => {
        const { themeMode, highContrast } = get();
        const base = themeMode === 'light' ? LIGHT_THEME : AMOLED_THEME;
        if (highContrast) {
          return {
            ...base,
            border: '#444444',
            borderActive: '#FFFFFF',
            textSecondary: '#CCCCCC',
          };
        }
        return base;
      },
    }),
    {
      name: 'krnl-theme-store',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
