import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { APP_PERMISSIONS, openSpecialPermissionSettings } from '../services/permissions';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { HudHeader } from '../components/HudHeader';
import { SPACING, appSignature } from '../design/tokens';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <HudHeader showBack title="PERMISSÕES // CONTROLE" subtitle="ACESSO MODULAR & PRIVACIDADE" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Emblem Banner */}
        <View style={styles.heroBox}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoHero}
            resizeMode="contain"
            accessibilityLabel="Emblema KRNL CORE"
          />
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{appSignature}</Text>
          <Text style={[styles.heroSubtitle, { color: accentColor }]}>
            TRANSPARÊNCIA TOTAL // ZERO TELEMETRIA EXTERNA
          </Text>
        </View>

        <HudCard
          title="Princípio de Honestidade"
          badge="OPCIONAL"
          badgeVariant="ok"
          subtitle="O app continua funcionando parcialmente sem permissões sensíveis"
        >
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Você decide exatamente quais módulos habilitar. Se preferir não conceder acesso a todos
            os arquivos, o app continuará funcionando para auditoria de bateria, RAM e rede.
          </Text>
        </HudCard>

        {APP_PERMISSIONS.map((perm) => (
          <HudCard
            key={perm.id}
            title={perm.name}
            badge={perm.isSpecialAccess ? 'ESPECIAL' : 'PADRÃO'}
            subtitle={perm.description}
          >
            <View style={[styles.justBox, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.justTitle, { color: accentColor }]}>POR QUE PRECISAMOS?</Text>
              <Text style={[styles.justText, { color: colors.textSecondary }]}>{perm.justification}</Text>
            </View>

            <View style={styles.tagsRow}>
              {perm.requiredFor.map((mod, i) => (
                <View key={i} style={[styles.tag, { borderColor: colors.borderActive, backgroundColor: colors.surface }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>{mod}</Text>
                </View>
              ))}
            </View>

            <View style={styles.btnRow}>
              <HudButton
                label="CONCEDER"
                variant="primary"
                style={{ flex: 1, marginRight: 6 }}
                onPress={() => openSpecialPermissionSettings(perm.id)}
              />
              <HudButton
                label="AGORA NÃO"
                variant="ghost"
                style={{ flex: 1 }}
                onPress={() => {}}
              />
            </View>
          </HudCard>
        ))}

        <HudButton
          label="CONCLUIR E ACESSAR O PAINEL"
          variant="primary"
          style={{ marginTop: SPACING.md }}
          onPress={() => router.replace('/(tabs)')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: SPACING.md },
  heroBox: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  logoHero: {
    width: 120,
    height: 120,
    marginBottom: SPACING.xs,
  },
  heroTitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  bodyText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  justBox: {
    borderWidth: 1,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    borderRadius: 2,
  },
  justTitle: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  justText: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
    lineHeight: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: SPACING.xs,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  tagText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
});
