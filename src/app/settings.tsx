import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { ACCENT_PRESETS, SPACING } from '../design/tokens';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    getColors,
    accentColor,
    themeMode,
    reduceMotion,
    highContrast,
    expertMode,
    setThemeMode,
    setAccentColor,
    setReduceMotion,
    setHighContrast,
    setExpertMode,
  } = useThemeStore();
  const colors = getColors();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>&lt; PAINEL</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: accentColor }]}>PERSONALIZAÇÃO // HUD</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {/* Accent Color Palette */}
        <HudCard title="Cor de Destaque (Accent)" badge="RGB">
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Define o tom técnico dos anéis de dados, indicadores e bordas ativas.
          </Text>
          <View style={styles.presetsGrid}>
            {ACCENT_PRESETS.map((preset) => {
              const isSelected = accentColor.toUpperCase() === preset.hex.toUpperCase();
              return (
                <TouchableOpacity
                  key={preset.hex}
                  style={[
                    styles.presetItem,
                    {
                      borderColor: isSelected ? '#FFFFFF' : colors.border,
                      backgroundColor: colors.surfaceAlt,
                    },
                  ]}
                  onPress={() => setAccentColor(preset.hex)}
                >
                  <View style={[styles.colorDot, { backgroundColor: preset.hex }]} />
                  <Text style={[styles.presetName, { color: colors.textPrimary }]}>
                    {preset.name}
                  </Text>
                  {isSelected && <Text style={[styles.activeMark, { color: preset.hex }]}>[ATIVO]</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </HudCard>

        {/* Theme Mode */}
        <HudCard title="Modo Visual de Superfície">
          <View style={styles.switchRow}>
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>PRETO AMOLED PURO (#000000)</Text>
            <Switch
              value={themeMode === 'amoled'}
              onValueChange={(val) => setThemeMode(val ? 'amoled' : 'light')}
              thumbColor={accentColor}
              trackColor={{ false: colors.surfaceAlt, true: '#333333' }}
            />
          </View>
        </HudCard>

        {/* Accessibility & Render Controls */}
        <HudCard title="Controles de Renderização & Acessibilidade">
          <View style={styles.switchRow}>
            <View style={styles.labelCol}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>ALTO CONTRASTE</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Bordas reforçadas de 2px e maior contraste de texto</Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              thumbColor={accentColor}
              trackColor={{ false: colors.surfaceAlt, true: '#333333' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.labelCol}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>REDUZIR MOVIMENTO</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Desativa animações interpoladas e transições</Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              thumbColor={accentColor}
              trackColor={{ false: colors.surfaceAlt, true: '#333333' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.labelCol}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>MODO ESPECIALISTA</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Exibe nomes técnicos de pacotes e caminhos completos no disco</Text>
            </View>
            <Switch
              value={expertMode}
              onValueChange={setExpertMode}
              thumbColor={accentColor}
              trackColor={{ false: colors.surfaceAlt, true: '#333333' }}
            />
          </View>
        </HudCard>

        {/* Links to Subscriptions and System Info */}
        <HudCard title="Licenciamento & Versão">
          <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
            KRNL Core — Edição de Manutenção e Auditoria Aberta.
          </Text>
          <HudButton
            label="GERENCIAR PLANO PRO (R$ 9,90/mês)"
            variant="secondary"
            style={{ marginTop: SPACING.sm }}
            onPress={() => router.push('/subscription')}
          />
        </HudCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  content: {
    padding: SPACING.md,
  },
  subText: {
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: SPACING.sm,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  presetItem: {
    width: '48%',
    borderWidth: 1,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  colorDot: {
    width: 12,
    height: 12,
    marginRight: 8,
  },
  presetName: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  activeMark: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  labelCol: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  rowLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  rowSub: {
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1F1F1F',
    marginVertical: SPACING.xs,
  },
});
