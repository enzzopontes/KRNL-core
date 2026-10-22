import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { APP_PERMISSIONS, openSpecialPermissionSettings, PermissionDefinition } from '../services/permissions';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { SPACING } from '../design/tokens';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>&lt; VOLTAR</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: accentColor }]}>PERMISSÕES // TRANSPARÊNCIA</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <HudCard title="Princípio de Integridade">
          <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
            O KRNL Core funciona parcialmente sem nenhuma permissão especial. Você decide
            exatamente quais módulos liberar. Nenhum arquivo, foto ou dado de uso sai do aparelho.
          </Text>
        </HudCard>

        {APP_PERMISSIONS.map((perm) => (
          <HudCard key={perm.id} title={perm.name} badge={perm.isSpecialAccess ? 'ESPECIAL' : 'PADRÃO'}>
            <Text style={[styles.desc, { color: colors.textPrimary }]}>{perm.description}</Text>
            <View style={styles.justBox}>
              <Text style={[styles.justTitle, { color: accentColor }]}>POR QUE PRECISAMOS?</Text>
              <Text style={[styles.justText, { color: colors.textSecondary }]}>{perm.justification}</Text>
            </View>
            <View style={styles.tagsRow}>
              {perm.requiredFor.map((mod, i) => (
                <View key={i} style={[styles.tag, { borderColor: colors.border }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>{mod}</Text>
                </View>
              ))}
            </View>
            <HudButton
              label={`CONFIGURAR NO ANDROID`}
              variant="secondary"
              onPress={() => openSpecialPermissionSettings(perm.id)}
            />
          </HudCard>
        ))}

        <HudButton
          label="CONCLUIR E RETORNAR AO PAINEL"
          variant="primary"
          style={{ marginTop: SPACING.md }}
          onPress={() => router.replace('/')}
        />
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
  bodyText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 18,
  },
  desc: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  justBox: {
    backgroundColor: '#0F0F0F',
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    borderLeftWidth: 2,
    borderLeftColor: '#333333',
  },
  justTitle: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  justText: {
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 15,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: SPACING.xs,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: 'monospace',
    fontSize: 9,
  },
});
