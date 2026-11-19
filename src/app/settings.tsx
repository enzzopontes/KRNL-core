import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { ACCENT_PRESETS, SPACING, appSignature, appVersion } from '../design/tokens';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { HudHeader } from '../components/HudHeader';
import { HudBottomBar } from '../components/HudBottomBar';
import { generateAndShareSystemReport } from '../services/reportExport';

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
      <HudHeader showBack title="PERSONALIZAÇÃO // HUD" subtitle="TOKENS VISUAIS & PARÂMETROS" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 84 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Accent Color Palette with Live Preview */}
        <HudCard
          title="Tom de Destaque Técnico (Accent)"
          badge="PALETA HUD"
          badgeVariant="accent"
          subtitle="Define o tom dos anéis Skia, sparklines e contornos ativos"
        >
          <View style={styles.presetsGrid}>
            {ACCENT_PRESETS.map((preset) => {
              const isSelected = accentColor.toUpperCase() === preset.hex.toUpperCase();
              return (
                <TouchableOpacity
                  key={preset.hex}
                  activeOpacity={0.8}
                  style={[
                    styles.presetItem,
                    {
                      borderColor: isSelected ? accentColor : colors.border,
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.05)' : colors.surfaceAlt,
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

        {/* Surface Visual Mode */}
        <HudCard
          title="Superfície & Fundo"
          badge="AMOLED"
          subtitle="Preto absoluto (#000000) otimizado para economia de pixels orgânicos"
        >
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
        <HudCard
          title="Acessibilidade & Motor de Render"
          badge="WCAG 2.1"
          subtitle="Ajuste de contraste, renderização e detalhamento de caminhos"
        >
          <View style={styles.switchRow}>
            <View style={styles.labelCol}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>ALTO CONTRASTE</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Bordas reforçadas de 2px e maior contraste de rótulos
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              thumbColor={accentColor}
              trackColor={{ false: colors.surfaceAlt, true: '#333333' }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.switchRow}>
            <View style={styles.labelCol}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>REDUZIR MOVIMENTO</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Desativa transições animadas e adota cortes diretos
              </Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              thumbColor={accentColor}
              trackColor={{ false: colors.surfaceAlt, true: '#333333' }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.switchRow}>
            <View style={styles.labelCol}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>MODO ESPECIALISTA</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Exibe caminhos absolutos no disco e nomes de pacotes APK
              </Text>
            </View>
            <Switch
              value={expertMode}
              onValueChange={setExpertMode}
              thumbColor={accentColor}
              trackColor={{ false: colors.surfaceAlt, true: '#333333' }}
            />
          </View>
        </HudCard>

        {/* Diagnostic Logs & Support */}
        <HudCard title="Auditoria, Logs & Exportação">
          <HudButton
            label="EXPORTAR RELATÓRIO DO SISTEMA (JSON)"
            variant="secondary"
            onPress={generateAndShareSystemReport}
          />
          <HudButton
            label="CENTRAL DE SUPORTE // FAQ & DIAGNÓSTICO"
            variant="secondary"
            style={{ marginTop: SPACING.sm }}
            onPress={() => router.push('/support')}
          />
        </HudCard>

        {/* About Card with Real HUD Logo from assets/logo.png */}
        <HudCard title="Assinatura do Sistema & Identidade" badge={appVersion}>
          <View style={styles.aboutContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoEmblem}
              resizeMode="contain"
              accessibilityLabel="Emblema Oficial KRNL CORE"
            />
            <Text style={[styles.aboutTitle, { color: colors.textPrimary }]}>{appSignature}</Text>
            <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
              Instrumento técnico de auditoria local, limpeza de armazenamento com quarentena,
              algoritmo xxHash64 e telemetria transparente.
            </Text>
          </View>
          <HudButton
            label="GERENCIAR LICENÇA PRO"
            variant="primary"
            style={{ marginTop: SPACING.sm }}
            onPress={() => router.push('/subscription')}
          />
        </HudCard>
      </ScrollView>

      <HudBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: SPACING.md },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: SPACING.xs,
  },
  presetItem: {
    width: '48%',
    borderWidth: 1,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 2,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginRight: 8,
  },
  presetName: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '800',
    flex: 1,
  },
  activeMark: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '900',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
  },
  labelCol: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  rowLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '800',
  },
  rowSub: {
    fontFamily: 'monospace',
    fontSize: 9,
    marginTop: 2,
    lineHeight: 13,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  logoEmblem: {
    width: 130,
    height: 130,
    marginBottom: SPACING.sm,
  },
  aboutTitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 2,
  },
  aboutDesc: {
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 15,
  },
});
