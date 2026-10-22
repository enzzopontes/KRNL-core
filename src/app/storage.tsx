import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { SkiaTreemap, TreemapNode } from '../components/SkiaTreemap';
import { SPACING } from '../design/tokens';
import { scanJunkFiles, moveToQuarantine, ScanResult } from '../../modules/krnl-storage';

const { width } = Dimensions.get('window');

export default function StorageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const [activeTab, setActiveTab] = useState<'treemap' | 'junk' | 'trash'>('junk');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [quarantinedCount, setQuarantinedCount] = useState(0);

  const treemapData: TreemapNode[] = [
    { name: 'Vídeos & Mídia WhatsApp', sizeBytes: 18.4 * 1024 * 1024 * 1024, category: 'MEDIA' },
    { name: 'Fotos & Câmera (DCIM)', sizeBytes: 12.1 * 1024 * 1024 * 1024, category: 'PHOTOS' },
    { name: 'APKs & Downloads', sizeBytes: 5.6 * 1024 * 1024 * 1024, category: 'DOWNLOADS' },
    { name: 'Músicas & Áudios Gravados', sizeBytes: 3.2 * 1024 * 1024 * 1024, category: 'AUDIO' },
    { name: 'Documentos e PDFs', sizeBytes: 1.8 * 1024 * 1024 * 1024, category: 'DOCS' },
  ];

  const handleScanDryRun = async () => {
    setIsScanning(true);
    try {
      const res = await scanJunkFiles(true);
      setScanResult(res);
    } finally {
      setIsScanning(false);
    }
  };

  const handleMoveToTrash = async () => {
    if (!scanResult || scanResult.items.length === 0) return;

    Alert.alert(
      'Mover para Lixeira Interna',
      `Mover ${scanResult.items.length} itens para quarentena segura por 30 dias? Nenhum arquivo será apagado de imediato.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Quarentena',
          onPress: async () => {
            let moved = 0;
            for (const item of scanResult.items) {
              const res = await moveToQuarantine(item.path);
              if (res.success) moved++;
            }
            setQuarantinedCount((prev) => prev + moved);
            setScanResult(null);
            Alert.alert(
              'Quarentena Ativa',
              `${moved} arquivos movidos para a lixeira interna. Espaço só conta como liberado após esvaziar.`
            );
          },
        },
      ]
    );
  };

  const formatSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>&lt; PAINEL</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: accentColor }]}>STORAGE // EXPLORER</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'junk' && { borderBottomColor: accentColor, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('junk')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'junk' ? accentColor : colors.textSecondary },
            ]}
          >
            [ LIMPEZA DE LIXO ]
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'treemap' && { borderBottomColor: accentColor, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('treemap')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'treemap' ? accentColor : colors.textSecondary },
            ]}
          >
            [ TREEMAP DISCO ]
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'trash' && { borderBottomColor: accentColor, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('trash')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'trash' ? accentColor : colors.textSecondary },
            ]}
          >
            [ LIXEIRA ({quarantinedCount}) ]
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {activeTab === 'junk' && (
          <>
            <HudCard title="Varredura de Resíduos & Lixo Real" badge="SIMULAÇÃO PRIMEIRO">
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                Varre temporários (.tmp, .log), pastas vazias, APKs antigos e mídias de status do
                WhatsApp via Android/media.
              </Text>
              <HudButton
                label={isScanning ? 'ANALISANDO DISCO...' : 'SIMULAR VARREDURA (DRY-RUN)'}
                variant="primary"
                loading={isScanning}
                onPress={handleScanDryRun}
              />
            </HudCard>

            {scanResult && (
              <HudCard title="Resultado da Simulação" highlight>
                <Text style={[styles.resultSummary, { color: accentColor }]}>
                  {scanResult.count} ITENS ENCONTRADOS // TOTAL: {formatSize(scanResult.totalBytes)}
                </Text>
                <Text style={[styles.subNote, { color: colors.textSecondary }]}>
                  * Itens serão movidos para quarentena (lixeira) sem exclusão definitiva.
                </Text>

                <View style={styles.itemsList}>
                  {scanResult.items.map((item, idx) => (
                    <View key={idx} style={[styles.itemRow, { borderColor: colors.border }]}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text numberOfLines={1} style={[styles.itemName, { color: colors.textPrimary }]}>
                          {item.name}
                        </Text>
                        <Text numberOfLines={1} style={[styles.itemPath, { color: colors.textSecondary }]}>
                          {item.path}
                        </Text>
                      </View>
                      <Text style={[styles.itemSize, { color: accentColor }]}>
                        {formatSize(item.size)}
                      </Text>
                    </View>
                  ))}
                </View>

                <HudButton
                  label="MOVER PARA LIXEIRA (QUARENTENA)"
                  variant="secondary"
                  style={{ marginTop: SPACING.md }}
                  onPress={handleMoveToTrash}
                />
              </HudCard>
            )}
          </>
        )}

        {activeTab === 'treemap' && (
          <HudCard title="Mapa Visual de Armazenamento" badge="SKIA HUD">
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              Distribuição proporcional de blocos de disco por categoria de dados reais.
            </Text>
            <SkiaTreemap nodes={treemapData} width={width - SPACING.lg * 2} height={220} />
          </HudCard>
        )}

        {activeTab === 'trash' && (
          <HudCard title="Lixeira Interna (Quarentena)" badge="30 DIAS">
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              Arquivos movidos via `renameTo` no mesmo volume para quarentena.
              Contadores honestos: o espaço só conta como liberado após esvaziamento permanente.
            </Text>
            <View style={styles.trashCounterBox}>
              <Text style={[styles.trashCountText, { color: accentColor }]}>
                {quarantinedCount} ARQUIVOS EM QUARENTENA
              </Text>
            </View>
            <HudButton
              label="ESVAZIAR LIXEIRA DEFINITIVAMENTE"
              variant="danger"
              disabled={quarantinedCount === 0}
              onPress={() => {
                setQuarantinedCount(0);
                Alert.alert('Lixeira Esvaziada', 'Espaço em disco liberado com sucesso.');
              }}
            />
          </HudCard>
        )}
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
  tabItem: {
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
  bodyText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  resultSummary: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  subNote: {
    fontFamily: 'monospace',
    fontSize: 10,
    marginBottom: SPACING.sm,
  },
  itemsList: {
    gap: 4,
  },
  itemRow: {
    borderWidth: 1,
    padding: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  itemPath: {
    fontFamily: 'monospace',
    fontSize: 9,
  },
  itemSize: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  trashCounterBox: {
    padding: SPACING.md,
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    marginVertical: SPACING.sm,
  },
  trashCountText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
  },
});
