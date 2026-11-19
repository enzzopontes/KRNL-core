import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudHeader } from '../components/HudHeader';
import { HudBottomBar } from '../components/HudBottomBar';
import { HudSegmentedControl, SegmentOption } from '../components/HudSegmentedControl';
import { HudRiskBadge, RiskLevel } from '../components/HudRiskBadge';
import { SPACING, touch } from '../design/tokens';
import {
  getInstalledApps,
  openAppDetails,
  requestUninstall,
  AppInfo,
} from '../../modules/krnl-apps';

type AppsTab = 'debloat' | 'inactive' | 'permissions';

export default function AppsManagerScreen() {
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const [apps, setApps] = useState<AppInfo[]>([]);
  const [filter, setFilter] = useState<AppsTab>('debloat');
  const [inactiveDaysThreshold, setInactiveDaysThreshold] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  const loadApps = async () => {
    try {
      const list = await getInstalledApps();
      setApps(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleAction = (app: AppInfo) => {
    if (app.debloatRisk === 'CRITICAL') {
      Alert.alert(
        'Ação Bloqueada // Proteção de Kernel',
        'Este pacote é essencial para a inicialização e estabilidade do Android. Modificá-lo causaria falhas no sistema.'
      );
      return;
    }

    if (app.isSystem) {
      Alert.alert(
        'Modo Seguro Play Store',
        `Abrir detalhes de "${app.label}" nas Configurações do Android para Desativar com segurança?`,
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
    if (filter === 'inactive') return (app.lastUsedDaysAgo ?? 0) >= inactiveDaysThreshold;
    if (filter === 'debloat') return !!app.debloatRisk;
    return true;
  });

  const formatSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  const tabOptions: SegmentOption<AppsTab>[] = [
    { id: 'debloat', label: 'Debloat Seguro' },
    { id: 'inactive', label: `Inativos (${inactiveDaysThreshold}d+)` },
    { id: 'permissions', label: 'Permissões' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <HudHeader showBack title="APPS // DEBLOATER" subtitle="GERENCIAMENTO NATIVO & RISCOS" />

      <View style={{ paddingHorizontal: SPACING.md }}>
        <HudSegmentedControl
          options={tabOptions}
          selectedId={filter}
          onSelect={(id) => setFilter(id)}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 84 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Inactivity Threshold Selector */}
        {filter === 'inactive' && (
          <View style={[styles.thresholdCard, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.thresholdLabel, { color: colors.textSecondary }]}>JANELA DE INATIVIDADE:</Text>
            <View style={styles.thresholdChipsRow}>
              {([30, 60, 90] as const).map((days) => {
                const active = inactiveDaysThreshold === days;
                return (
                  <TouchableOpacity
                    key={days}
                    activeOpacity={0.8}
                    style={[
                      styles.thresholdChip,
                      {
                        borderColor: active ? accentColor : colors.border,
                        backgroundColor: active ? accentColor : colors.surface,
                      },
                    ]}
                    onPress={() => setInactiveDaysThreshold(days)}
                  >
                    <Text
                      style={[
                        styles.thresholdText,
                        { color: active ? '#000000' : colors.textPrimary },
                      ]}
                    >
                      {days} DIAS
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {filter !== 'permissions' && (
          <HudCard
            title="Debloater Modo Seguro"
            badge="SEM ROOT / SEGURO"
            badgeVariant="ok"
            subtitle="Classificação por risco de desativação com bloqueio permanente de pacotes críticos"
          >
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              O descarte ou desativação redireciona para a tela do sistema. Nada é quebrado silenciosamente.
            </Text>
          </HudCard>
        )}

        {/* Tab 3: Sensitive permissions audit */}
        {filter === 'permissions' && (
          <HudCard
            title="Auditoria de Permissões Sensíveis"
            badge="PRIVACIDADE"
            badgeVariant="accent"
            subtitle="Monitore apps com acesso a vetores sensíveis do dispositivo"
          >
            {[
              { label: 'CÂMERA & MICROFONE', desc: 'Acesso a captação de imagem e áudio em primeiro ou segundo plano.' },
              { label: 'LOCALIZAÇÃO EM SEGUNDO PLANO', desc: 'Rastreamento contínuo de coordenadas geográficas.' },
              { label: 'SERVIÇOS DE ACESSIBILIDADE', desc: 'Capacidade de ler textos de tela e interagir com outros apps.' },
              { label: 'SOBREPOSIÇÃO DE TELA', desc: 'Capacidade de desenhar sobre outros aplicativos (risco de phishing).' },
              { label: 'INSTALAÇÃO DE PACOTES', desc: 'Capacidade de solicitar instalação de APKs fora da Play Store.' },
            ].map((perm, idx) => (
              <View key={idx} style={[styles.permItemBox, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.permTitle, { color: colors.textPrimary }]}>{perm.label}</Text>
                  <Text style={[styles.permDesc, { color: colors.textSecondary }]}>{perm.desc}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: accentColor }]}
                  onPress={() => openAppDetails('com.android.settings')}
                >
                  <Text style={[styles.actionText, { color: accentColor }]}>[REVISAR]</Text>
                </TouchableOpacity>
              </View>
            ))}
          </HudCard>
        )}

        {loading && (
          <View style={{ paddingVertical: SPACING.lg, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={accentColor} />
          </View>
        )}

        {!loading &&
          filter !== 'permissions' &&
          filteredApps.map((app) => (
            <View
              key={app.packageName}
              style={[styles.appItem, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <View style={styles.appHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.appLabel, { color: colors.textPrimary }]}>{app.label}</Text>
                  <Text style={[styles.pkgName, { color: colors.textSecondary }]}>{app.packageName}</Text>
                </View>
                {app.debloatRisk && (
                  <HudRiskBadge level={app.debloatRisk as RiskLevel} />
                )}
              </View>

              <View style={[styles.appFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {formatSize(app.sizeBytes)} • {app.isSystem ? 'SISTEMA' : 'USUÁRIO'}
                  {app.lastUsedDaysAgo !== undefined && ` • ${app.lastUsedDaysAgo}d atrás`}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { borderColor: app.debloatRisk === 'CRITICAL' ? colors.border : accentColor },
                  ]}
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
          ))}
      </ScrollView>

      <HudBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: SPACING.md },
  thresholdCard: {
    borderWidth: 1,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thresholdLabel: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
  thresholdChipsRow: { flexDirection: 'row', gap: 6 },
  thresholdChip: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  thresholdText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
  noteText: { fontFamily: 'monospace', fontSize: 11, lineHeight: 16 },
  appItem: { borderWidth: 1, padding: SPACING.md, marginVertical: 4, borderRadius: 2 },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  appLabel: { fontFamily: 'monospace', fontSize: 12, fontWeight: '800' },
  pkgName: { fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs + 2,
    borderTopWidth: 1,
  },
  metaText: { fontFamily: 'monospace', fontSize: 9 },
  actionBtn: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 2, minHeight: touch.min - 16, justifyContent: 'center' },
  actionText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
  permItemBox: {
    borderWidth: 1,
    padding: SPACING.md,
    marginVertical: 4,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permTitle: { fontFamily: 'monospace', fontSize: 11, fontWeight: '800' },
  permDesc: { fontFamily: 'monospace', fontSize: 9, marginTop: 3, lineHeight: 13 },
});
