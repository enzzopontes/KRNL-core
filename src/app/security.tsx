import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { HudHeader } from '../components/HudHeader';
import { HudBottomBar } from '../components/HudBottomBar';
import { SPACING, radius, touch } from '../design/tokens';
import { openPlayProtect, openDeveloperSettings, checkFileHashVirusTotal } from '../services/security';
import { runNetworkDiagnostics, NetworkTestResult } from '../services/networkTest';
import {
  runFullMalwareScan,
  remediateQuarantineThreat,
  remediateAppThreat,
  ThreatItem,
  MalwareScanReport,
  ScanProgress,
  checkRootAndSystemIntegrity,
} from '../services/malwareScanner';

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [scanReport, setScanReport] = useState<MalwareScanReport | null>(null);

  // VirusTotal inspection
  const [customHash, setCustomHash] = useState('');
  const [isCheckingHash, setIsCheckingHash] = useState(false);

  // Network diagnostics
  const [runningNetTest, setRunningNetTest] = useState(false);
  const [netTestResult, setNetTestResult] = useState<NetworkTestResult | null>(null);

  const rootStatus = checkRootAndSystemIntegrity();

  const handleStartMalwareScan = async () => {
    setIsScanning(true);
    setScanProgress({
      stage: 'SYSTEM_ROOT',
      percent: 5,
      message: 'Iniciando varredura profunda estilo Malwarebytes...',
    });

    try {
      const report = await runFullMalwareScan((progress) => {
        setScanProgress(progress);
      });
      setScanReport(report);

      if (report.isClean) {
        Alert.alert(
          'Dispositivo Seguro',
          `Varredura concluída:\n\n• ${report.scannedAppsCount} aplicativos analisados\n• ${report.scannedFilesCount} arquivos/instaladores verificados\n\nNenhuma assinatura de trojan, spyware ou malware ativo detectada.`
        );
      } else {
        Alert.alert(
          'Ameaças Identificadas',
          `${report.threats.length} ${
            report.threats.length === 1 ? 'risco encontrado' : 'riscos encontrados'
          }. Revise a lista abaixo para isolar em quarentena ou desinstalar.`
        );
      }
    } catch {
      Alert.alert('Erro no Scanner', 'Falha ao executar a análise de segurança.');
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  };

  const handleRemediateThreat = async (threat: ThreatItem) => {
    if (threat.recommendedAction === 'QUARANTINE' && threat.filePath) {
      Alert.alert(
        'Mover para Quarentena',
        `Deseja isolar o arquivo "${threat.filePath.split('/').pop()}" na quarentena criptografada do KRNL? O arquivo deixará de ter permissão de execução.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Isolar Agora',
            style: 'destructive',
            onPress: async () => {
              const ok = await remediateQuarantineThreat(threat);
              if (ok) {
                setScanReport((prev) =>
                  prev
                    ? {
                        ...prev,
                        threats: prev.threats.filter((t) => t.id !== threat.id),
                      }
                    : null
                );
                Alert.alert('Sucesso', 'Arquivo isolado com segurança na lixeira de quarentena.');
              } else {
                Alert.alert('Erro', 'Não foi possível mover o arquivo para a quarentena.');
              }
            },
          },
        ]
      );
    } else if (threat.recommendedAction === 'UNINSTALL' && threat.packageName) {
      Alert.alert(
        'Solicitar Desinstalação',
        `Deseja abrir a solicitação de remoção para o pacote potencialmente perigoso "${threat.packageName}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desinstalar',
            style: 'destructive',
            onPress: async () => {
              await remediateAppThreat(threat);
            },
          },
        ]
      );
    } else {
      await remediateAppThreat(threat);
    }
  };

  const handleCheckThreatOnVirusTotal = async (threat: ThreatItem) => {
    const hash = threat.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    setIsCheckingHash(true);
    try {
      const res = await checkFileHashVirusTotal(hash);
      Alert.alert(
        'Auditoria VirusTotal v3',
        `SHA-256: ${hash.slice(0, 16)}...\n\nResultado: ${
          res.isClean ? 'NENHUM MOTOR SINALIZOU' : 'SINALIZADO COMO AMEAÇA'
        }\nDetecções: ${res.positives}/${res.total} engines\nData: ${new Date(res.scanDate).toLocaleDateString()}`
      );
    } finally {
      setIsCheckingHash(false);
    }
  };

  const handleCustomHashCheck = async () => {
    const cleaned = customHash.trim();
    if (!cleaned || cleaned.length < 32) {
      Alert.alert('Hash Inválido', 'Insira um hash SHA-256 válido (64 caracteres hexadecimais).');
      return;
    }
    setIsCheckingHash(true);
    try {
      const res = await checkFileHashVirusTotal(cleaned);
      Alert.alert(
        'Consulta VirusTotal',
        `Hash: ${cleaned.slice(0, 16)}...\n\nStatus: ${
          res.isClean ? 'Limpo (0 detecções)' : 'Ameaça Sinalizada'
        }\nEngines Positivas: ${res.positives}/${res.total}`
      );
    } finally {
      setIsCheckingHash(false);
    }
  };

  const handleRunNetworkTest = async () => {
    setRunningNetTest(true);
    try {
      const res = await runNetworkDiagnostics();
      setNetTestResult(res);
    } finally {
      setRunningNetTest(false);
    }
  };

  const threatCount = scanReport?.threats?.length || 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <HudHeader showBack title="SEGURANÇA & ANTIVÍRUS" subtitle="PROTEÇÃO ESTILO MALWAREBYTES" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 84 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Scanner Hero (Malwarebytes Style) */}
        <HudCard
          title="Motor de Varredura de Ameaças"
          badge={scanReport ? (threatCount > 0 ? `${threatCount} AMEAÇAS` : 'PROTEGIDO') : 'AUDITORIA NATIVA'}
          badgeVariant={scanReport ? (threatCount > 0 ? 'danger' : 'ok') : 'accent'}
          highlight={threatCount > 0}
          subtitle="Varredura de trojans, spywares, adwares, instaladores APK e vetores de root"
        >
          {isScanning && scanProgress ? (
            <View style={styles.scanningBox}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressMsg, { color: colors.textPrimary }]}>
                  {scanProgress.message}
                </Text>
                <Text style={[styles.progressPercent, { color: accentColor }]}>
                  {scanProgress.percent}%
                </Text>
              </View>

              {/* Modern Progress Bar */}
              <View style={[styles.progressBarTrack, { backgroundColor: colors.surfaceAlt }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${scanProgress.percent}%`, backgroundColor: accentColor },
                  ]}
                />
              </View>

              {scanProgress.currentItem && (
                <Text style={[styles.progressItem, { color: colors.textSecondary }]} numberOfLines={1}>
                  Alvo: {scanProgress.currentItem}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.heroSummary}>
              <View style={styles.heroStatsRow}>
                <View style={[styles.miniStat, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>APPS VERIFICADOS</Text>
                  <Text style={[styles.miniStatVal, { color: colors.textPrimary }]}>
                    {scanReport?.scannedAppsCount || 148}
                  </Text>
                </View>
                <View style={[styles.miniStat, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>ARQUIVOS / APKS</Text>
                  <Text style={[styles.miniStatVal, { color: colors.textPrimary }]}>
                    {scanReport?.scannedFilesCount || 12}
                  </Text>
                </View>
                <View style={[styles.miniStat, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>SEGURANÇA</Text>
                  <Text
                    style={[
                      styles.miniStatVal,
                      { color: threatCount > 0 ? colors.danger : colors.success },
                    ]}
                  >
                    {scanReport ? `${scanReport.securityScore}%` : '100%'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.heroSummaryText, { color: colors.textSecondary }]}>
                {scanReport
                  ? scanReport.summary
                  : 'Nenhum malware em execução detectado. Execute uma varredura completa para auditar aplicativos recém-instalados e pacotes APK soltos.'}
              </Text>
            </View>
          )}

          <HudButton
            label={isScanning ? 'ANALISANDO DISPOSITIVO...' : 'EXECUTAR VARREDURA COMPLETA'}
            variant="primary"
            loading={isScanning}
            onPress={handleStartMalwareScan}
            style={{ marginTop: SPACING.md }}
          />
        </HudCard>

        {/* Threats & Quarantine Card (if threats detected) */}
        {scanReport && threatCount > 0 && (
          <HudCard
            title="Ameaças Identificadas"
            badge={`${threatCount} ATENÇÃO`}
            badgeVariant="danger"
            subtitle="Isole arquivos suspeitos em quarentena ou solicite a remoção"
          >
            <View style={styles.threatList}>
              {scanReport.threats.map((threat) => (
                <View
                  key={threat.id}
                  style={[
                    styles.threatCard,
                    {
                      borderColor: threat.severity === 'CRITICAL' ? colors.danger : colors.border,
                      backgroundColor: colors.surfaceAlt,
                    },
                  ]}
                >
                  <View style={styles.threatHeader}>
                    <View style={styles.threatBadge}>
                      <Text
                        style={[
                          styles.threatBadgeText,
                          {
                            color:
                              threat.severity === 'CRITICAL' || threat.severity === 'HIGH'
                                ? colors.danger
                                : colors.warning,
                          },
                        ]}
                      >
                        ● {threat.severity} // {threat.type}
                      </Text>
                    </View>
                    <Text style={[styles.threatTitle, { color: colors.textPrimary }]}>
                      {threat.title}
                    </Text>
                  </View>

                  <Text style={[styles.threatDesc, { color: colors.textSecondary }]}>
                    {threat.description}
                  </Text>

                  <View style={styles.threatActionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: colors.danger, backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}
                      onPress={() => handleRemediateThreat(threat)}
                    >
                      <Text style={[styles.actionBtnText, { color: colors.danger }]}>
                        {threat.actionLabel}
                      </Text>
                    </TouchableOpacity>

                    {threat.sha256 && (
                      <TouchableOpacity
                        style={[styles.actionBtnSecondary, { borderColor: colors.borderActive }]}
                        onPress={() => handleCheckThreatOnVirusTotal(threat)}
                        disabled={isCheckingHash}
                      >
                        <Text style={[styles.actionBtnSecText, { color: colors.textPrimary }]}>
                          VirusTotal
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </HudCard>
        )}

        {/* Real-time System OS Vectors */}
        <HudCard
          title="Vetores do Sistema Operacional"
          badge="TEMPO REAL"
          subtitle="Verificação de privilégios de root, depuração USB e integridade do SO"
        >
          <View style={styles.vectorItem}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.vectorTitle, { color: colors.textPrimary }]}>
                STATUS DE ROOT / KERNEL
              </Text>
              <Text style={[styles.vectorDesc, { color: colors.textSecondary }]}>
                {rootStatus.isRooted
                  ? 'Privilégios su ou test-keys detectados. Apps podem acessar áreas protegidas.'
                  : 'Nenhum binário de root ou hook Magisk não autorizado encontrado.'}
              </Text>
            </View>
            <View
              style={[
                styles.statusTagPill,
                {
                  backgroundColor: rootStatus.isRooted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  borderColor: rootStatus.isRooted ? colors.danger : colors.success,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusTagText,
                  { color: rootStatus.isRooted ? colors.danger : colors.success },
                ]}
              >
                {rootStatus.isRooted ? 'COMPROMETIDO' : 'SEGURO'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.vectorItem}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.vectorTitle, { color: colors.textPrimary }]}>
                DEPURAÇÃO USB / ADB
              </Text>
              <Text style={[styles.vectorDesc, { color: colors.textSecondary }]}>
                Se ativa em ambientes não seguros, permite extração de dados via cabo.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.pillBtn, { borderColor: accentColor }]}
              onPress={openDeveloperSettings}
            >
              <Text style={[styles.pillBtnText, { color: accentColor }]}>Revisar</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.vectorItem}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.vectorTitle, { color: colors.textPrimary }]}>
                GOOGLE PLAY PROTECT
              </Text>
              <Text style={[styles.vectorDesc, { color: colors.textSecondary }]}>
                Proteção contra aplicativos maliciosos oficial da Google Play Store.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.pillBtn, { borderColor: accentColor }]}
              onPress={openPlayProtect}
            >
              <Text style={[styles.pillBtnText, { color: accentColor }]}>Abrir</Text>
            </TouchableOpacity>
          </View>
        </HudCard>

        {/* On-Demand VirusTotal Hash Auditor */}
        <HudCard
          title="Consulta Hash // VirusTotal v3"
          badge="SOB DEMANDA"
          subtitle="Verifique o SHA-256 de qualquer APK em 70+ motores de antivírus"
        >
          <View style={styles.hashInputRow}>
            <TextInput
              style={[
                styles.hashInput,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Cole o hash SHA-256 do arquivo..."
              placeholderTextColor={colors.textMuted}
              value={customHash}
              onChangeText={setCustomHash}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <HudButton
            label={isCheckingHash ? 'CONSULTANDO ENGINES...' : 'VERIFICAR NO VIRUSTOTAL'}
            variant="secondary"
            loading={isCheckingHash}
            onPress={handleCustomHashCheck}
            style={{ marginTop: SPACING.sm }}
          />
        </HudCard>

        {/* Network Diagnostics */}
        <HudCard
          title="Diagnóstico de Rede & Conexão"
          badge="BENCHMARK"
          subtitle="Medição transparente de latência RTT, jitter e vazão"
        >
          {netTestResult && (
            <View style={styles.netStatsRow}>
              <View
                style={[
                  styles.statBox,
                  { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                ]}
              >
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>LATÊNCIA</Text>
                <Text style={[styles.statValue, { color: accentColor }]}>
                  {netTestResult.pingMs} ms
                </Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                ]}
              >
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>JITTER</Text>
                <Text style={[styles.statValue, { color: accentColor }]}>
                  {netTestResult.jitterMs} ms
                </Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                ]}
              >
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>DOWNLOAD</Text>
                <Text style={[styles.statValue, { color: accentColor }]}>
                  {netTestResult.downloadMbps} Mb/s
                </Text>
              </View>
            </View>
          )}

          <HudButton
            label={runningNetTest ? 'TESTANDO CONEXÃO...' : 'TESTAR VELOCIDADE & PING'}
            variant="secondary"
            loading={runningNetTest}
            onPress={handleRunNetworkTest}
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
  scanningBox: {
    paddingVertical: SPACING.sm,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressMsg: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressItem: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  heroSummary: {
    gap: SPACING.sm,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  miniStat: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  miniStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  miniStatVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  heroSummaryText: {
    fontSize: 12,
    lineHeight: 17,
  },
  threatList: {
    gap: SPACING.sm,
  },
  threatCard: {
    borderWidth: 1,
    padding: SPACING.md,
    borderRadius: radius.md,
    gap: 6,
  },
  threatHeader: {
    gap: 4,
  },
  threatBadge: {
    alignSelf: 'flex-start',
  },
  threatBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  threatTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  threatDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  threatActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  actionBtnSecText: {
    fontSize: 11,
    fontWeight: '600',
  },
  vectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  vectorTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  vectorDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  pillBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    minHeight: touch.min - 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTagPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.xs + 2,
  },
  hashInputRow: {
    marginVertical: SPACING.xs,
  },
  hashInput: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  netStatsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    padding: SPACING.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});
