import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { SPACING } from '../design/tokens';
import {
  getInstalledApps,
  openAppDetails,
  requestUninstall,
  AppInfo,
} from '../../modules/krnl-apps';

export default function AppsManagerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const [apps, setApps] = useState<AppInfo[]>([]);
  const [filter, setFilter] = useState<'all' | 'inactive' | 'debloat'>('debloat');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    try {
      const list = await getInstalledApps();
      setApps(list);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'RECOMMENDED':
        return colors.success;
      case 'ADVANCED':
        return colors.warning;
      case 'DANGEROUS':
      case 'CRITICAL':
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const handleAction = (app: AppInfo) => {
    if (app.debloatRisk === 'CRITICAL') {
      Alert.alert(
        'Ação Bloqueada',
        'Este pacote é essencial para a inicialização do Android. Modificá-lo causaria instabilidade irreversível.'
      );
      return;
    }

    if (app.isSystem) {
      Alert.alert(
        'Modo Seguro Play Store',
        `Abrir detalhes de "${app.label}" no Android para Desativar ou Forçar Parada com segurança?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Configurações', onPress: () => openAppDetails(app.packageName) },
        ]
      );
    } else {
      requestUninstall(app.packageName);
    }
  };

  const filteredApps = apps.filter((app) => {
    if (filter === 'inactive') return (app.lastUsedDaysAgo ?? 0) >= 30;
    if (filter === 'debloat') return !!app.debloatRisk;
    return true;
  });

  const formatSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>&lt; PAINEL</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: accentColor }]}>APPS & DEBLOAT // AUDIT</Text>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, filter === 'debloat' && { borderBottomColor: accentColor, borderBottomWidth: 2 }]}
          onPress={() => setFilter('debloat')}
        >
          <Text style={[styles.tabText, { color: filter === 'debloat' ? accentColor : colors.textSecondary }]}>
            [ DEBLOATER SEGURO ]
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'inactive' && { borderBottomColor: accentColor, borderBottomWidth: 2 }]}
          onPress={() => setFilter('inactive')}
        >
          <Text style={[styles.tabText, { color: filter === 'inactive' ? accentColor : colors.textSecondary }]}>
            [ SEM USO 30D+ ]
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <HudCard title="Segurança & Transparência" badge="SEM ROOT / SEM RISCO">
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            O modo seguro direciona para a tela do sistema permitindo desativação controlada.
            Pacotes vitais para o kernel do Android são permanentemente travados no código.
          </Text>
        </HudCard>

        {filteredApps.map((app) => {
          const riskColor = getRiskColor(app.debloatRisk);
          return (
            <View key={app.packageName} style={[styles.appItem, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={styles.appHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.appLabel, { color: colors.textPrimary }]}>{app.label}</Text>
                  <Text style={[styles.pkgName, { color: colors.textSecondary }]}>{app.packageName}</Text>
                </View>
                {app.debloatRisk && (
                  <View style={[styles.badge, { borderColor: riskColor }]}>
                    <Text style={[styles.badgeText, { color: riskColor }]}>{app.debloatRisk}</Text>
                  </View>
                )}
              </View>

              <View style={styles.appFooter}>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  TAMANHO: {formatSize(app.sizeBytes)} • {app.isSystem ? 'SISTEMA' : 'USUÁRIO'}
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: app.debloatRisk === 'CRITICAL' ? colors.border : accentColor }]}
                  onPress={() => handleAction(app)}
                >
                  <Text
                    style={[
                      styles.actionText,
                      { color: app.debloatRisk === 'CRITICAL' ? colors.textMuted : accentColor },
                    ]}
                  >
                    {app.debloatRisk === 'CRITICAL' ? '[BLOQUEADO]' : '[GERENCIAR]'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.md,
  },
  noteText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  appItem: {
    borderWidth: 1,
    padding: SPACING.sm,
    marginVertical: 4,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appLabel: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  pkgName: {
    fontFamily: 'monospace',
    fontSize: 9,
    marginTop: 1,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  metaText: {
    fontFamily: 'monospace',
    fontSize: 9,
  },
  actionBtn: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
});
