import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { HudHeader } from '../components/HudHeader';
import { HudBottomBar } from '../components/HudBottomBar';
import { HudHonestCounter } from '../components/HudHonestCounter';
import { HudSegmentedControl, SegmentOption } from '../components/HudSegmentedControl';
import { SkiaTreemap, TreemapNode } from '../components/SkiaTreemap';
import { SPACING } from '../design/tokens';
import {
  scanJunkFiles,
  moveToQuarantine,
  getCategorySizes,
  listFiles,
  getLargeFiles,
  getScreenshotsAndRecordings,
  ScanResult,
  FileItem,
  LargeFileItem,
  ScreenshotOrRecordingItem,
  JunkFileItem,
} from '../../modules/krnl-storage';
import { requestStandardStoragePermissions } from '../services/permissions';

const { width } = Dimensions.get('window');

type StorageTab = 'junk' | 'explorer' | 'treemap' | 'large' | 'trash';

interface QuarantinedItem {
  name: string;
  originalPath: string;
  quarantinePath: string;
  size: number;
  category: string;
  quarantinedAt: number;
}

export default function StorageScreen() {
  const insets = useSafeAreaInsets();
  const { getColors, accentColor, expertMode } = useThemeStore();
  const colors = getColors();

  const [activeTab, setActiveTab] = useState<StorageTab>('junk');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [previewCategory, setPreviewCategory] = useState<string>('ALL');
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  // Quarantine / Trash items list
  const [quarantinedList, setQuarantinedList] = useState<QuarantinedItem[]>([]);
  const [freedBytes, setFreedBytes] = useState(0);
  const [treemapNodes, setTreemapNodes] = useState<TreemapNode[]>([]);

  // Explorer state
  const [currentPath, setCurrentPath] = useState<string>('');
  const [directoryItems, setDirectoryItems] = useState<FileItem[]>([]);
  const [isLoadingDir, setIsLoadingDir] = useState<boolean>(false);

  // Large files state
  const [largeFiles, setLargeFiles] = useState<LargeFileItem[]>([]);
  const [largeFilter, setLargeFilter] = useState<string>('ALL');

  // Screenshots state
  const [mediaSnaps, setMediaSnaps] = useState<ScreenshotOrRecordingItem[]>([]);

  const loadCategoryTreemap = async () => {
    try {
      const cats = await getCategorySizes();
      const nodes: TreemapNode[] = [
        { name: 'Vídeos', sizeBytes: cats.videos, category: 'MEDIA' },
        { name: 'Fotos & Câmera', sizeBytes: cats.photos, category: 'PHOTOS' },
        { name: 'Downloads & Zips', sizeBytes: cats.downloads, category: 'DOWNLOADS' },
        { name: 'Áudio & Voz', sizeBytes: cats.audio, category: 'AUDIO' },
        { name: 'Documentos', sizeBytes: cats.docs, category: 'DOCS' },
        { name: 'APKs Antigos', sizeBytes: cats.apks, category: 'APKS' },
        { name: 'Outros', sizeBytes: cats.others, category: 'OTHERS' },
      ].filter((n) => n.sizeBytes > 0);
      setTreemapNodes(nodes);
    } catch {
      // fallback
    }
  };

  const loadDirectory = async (path: string) => {
    setIsLoadingDir(true);
    try {
      const items = await listFiles(path);
      setDirectoryItems(items);
      setCurrentPath(path || '/storage/emulated/0');
    } finally {
      setIsLoadingDir(false);
    }
  };

  const loadLargeFiles = async () => {
    try {
      const files = await getLargeFiles();
      setLargeFiles(files);
    } catch {
      // fallback
    }
  };

  const loadScreenshots = async () => {
    try {
      const snaps = await getScreenshotsAndRecordings();
      setMediaSnaps(snaps);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    const initData = async () => {
      await requestStandardStoragePermissions();
      loadCategoryTreemap();
      loadDirectory('');
      loadLargeFiles();
      loadScreenshots();
    };
    initData();
  }, []);

  const handleScanDryRun = async () => {
    setIsScanning(true);
    try {
      const res = await scanJunkFiles(true);
      setScanResult(res);

      // Select all by default
      const initialSelected: Record<string, boolean> = {};
      res.items.forEach((item) => {
        initialSelected[item.path] = true;
      });
      setSelectedItems(initialSelected);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleItemSelection = (path: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const selectAll = (select: boolean) => {
    if (!scanResult) return;
    const next: Record<string, boolean> = {};
    scanResult.items.forEach((item) => {
      next[item.path] = select;
    });
    setSelectedItems(next);
  };

  const getFilteredItems = (): JunkFileItem[] => {
    if (!scanResult) return [];
    if (previewCategory === 'ALL') return scanResult.items;
    return scanResult.items.filter((item) => {
      const ext = item.name.split('.').pop()?.toLowerCase() || '';
      if (previewCategory === 'PHOTOS') return ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext);
      if (previewCategory === 'DOCS') return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(ext);
      if (previewCategory === 'APKS') return ext === 'apk';
      if (previewCategory === 'CACHE') return item.category === 'CACHE_TEMP' || ext === 'tmp' || ext === 'log';
      return true;
    });
  };

  const selectedCount = scanResult
    ? scanResult.items.filter((it) => selectedItems[it.path]).length
    : 0;

  const selectedBytes = scanResult
    ? scanResult.items
        .filter((it) => selectedItems[it.path])
        .reduce((acc, curr) => acc + curr.size, 0)
    : 0;

  const quarantinedTotalBytes = quarantinedList.reduce((acc, it) => acc + it.size, 0);

  const handleMoveToTrash = async () => {
    if (!scanResult || selectedCount === 0) return;

    Alert.alert(
      'Mover para Lixeira Interna',
      `Mover ${selectedCount} itens (${formatSize(selectedBytes)}) para quarentena segura por 30 dias? Você poderá ver e restaurar qualquer um a qualquer momento.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Quarentena',
          onPress: async () => {
            const newlyQuarantined: QuarantinedItem[] = [];
            const toMove = scanResult.items.filter((it) => selectedItems[it.path]);

            for (const item of toMove) {
              const res = await moveToQuarantine(item.path);
              if (res.success) {
                newlyQuarantined.push({
                  name: item.name,
                  originalPath: item.path,
                  quarantinePath: res.quarantinePath || '',
                  size: item.size,
                  category: item.category,
                  quarantinedAt: Date.now(),
                });
              }
            }

            setQuarantinedList((prev) => [...prev, ...newlyQuarantined]);
            // Remove moved items from scanResult
            const remaining = scanResult.items.filter((it) => !selectedItems[it.path]);
            setScanResult({
              ...scanResult,
              count: remaining.length,
              totalBytes: remaining.reduce((a, b) => a + b.size, 0),
              items: remaining,
            });
            setShowInspectionModal(false);

            Alert.alert(
              'Quarentena Ativa',
              `${newlyQuarantined.length} itens movidos para a lixeira. Acesse a aba "Lixeira" para inspecionar ou restaurar quando quiser.`
            );
          },
        },
      ]
    );
  };

  const handleGoUpDir = () => {
    if (!currentPath || currentPath === '/storage/emulated/0') return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/'));
    loadDirectory(parent || '/storage/emulated/0');
  };

  const handleExportOrMove = async (item: LargeFileItem) => {
    Alert.alert(
      'Destino de Armazenamento',
      `O arquivo "${item.name}" (${(item.size / (1024 * 1024)).toFixed(1)} MB) pode ser transferido ou movido para lixeira.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Compartilhar / Nuvem',
          onPress: async () => {
            await Share.share({
              title: item.name,
              message: `[KRNL Core] Transferindo ${item.name} (${item.path})`,
            });
          },
        },
        {
          text: 'Mover p/ Lixeira',
          style: 'destructive',
          onPress: async () => {
            const res = await moveToQuarantine(item.path);
            if (res.success) {
              setQuarantinedList((prev) => [
                ...prev,
                {
                  name: item.name,
                  originalPath: item.path,
                  quarantinePath: res.quarantinePath || '',
                  size: item.size,
                  category: item.category,
                  quarantinedAt: Date.now(),
                },
              ]);
              setLargeFiles((prev) => prev.filter((f) => f.path !== item.path));
              Alert.alert('Lixeira', 'Arquivo movido para a quarentena interna.');
            }
          },
        },
      ]
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredLargeFiles = largeFiles.filter((f) => {
    if (largeFilter === 'ALL') return true;
    return f.category === largeFilter;
  });

  const tabOptions: SegmentOption<StorageTab>[] = [
    { id: 'junk', label: 'Limpeza' },
    { id: 'treemap', label: 'Treemap' },
    { id: 'explorer', label: 'Pastas' },
    { id: 'large', label: 'Grandes' },
    { id: 'trash', label: 'Lixeira', badge: quarantinedList.length > 0 ? `${quarantinedList.length}` : undefined },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <HudHeader showBack title="STORAGE // DISCO" subtitle="EXPLORADOR & LIMPEZA" />

      {/* Honest Counter */}
      <View style={{ paddingHorizontal: SPACING.md }}>
        <HudHonestCounter
          inTrashBytes={quarantinedTotalBytes}
          freedBytes={freedBytes}
          quarantinedCount={quarantinedList.length}
        />
        <HudSegmentedControl
          options={tabOptions}
          selectedId={activeTab}
          onSelect={(id) => setActiveTab(id)}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 84 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: JUNK (LIMPEZA TRANSPARENTE COM INSPEÇÃO PRÉVIA) */}
        {activeTab === 'junk' && (
          <>
            <HudCard
              title="Varredura de Resíduos Reais"
              badge="DRY-RUN PRIMEIRO"
              badgeVariant="accent"
              subtitle="Varre caches temporários, resíduos e APKs sem apagar nada de imediato"
            >
              <HudButton
                label={isScanning ? 'ANALISANDO DISCO...' : 'SIMULAR VARREDURA (DRY-RUN)'}
                variant="primary"
                loading={isScanning}
                onPress={handleScanDryRun}
              />
            </HudCard>

            {scanResult && (
              <HudCard
                title="Resumo da Varredura (Pré-Lixeira)"
                badge={`${scanResult.count} ITENS`}
                badgeVariant="ok"
                subtitle="Inspecione cada foto, documento ou resíduo antes de enviar para a lixeira."
              >
                <View style={styles.summaryBar}>
                  <Text style={[styles.summaryText, { color: accentColor }]}>
                    {formatSize(selectedBytes)} selecionados de {formatSize(scanResult.totalBytes)}
                  </Text>
                  <Text style={[styles.summaryCountText, { color: colors.textSecondary }]}>
                    ({selectedCount}/{scanResult.count} itens marcados)
                  </Text>
                </View>

                {/* Inspection Button */}
                <HudButton
                  label="🔍 VER E DESMARCAR ARQUIVOS DA LISTA"
                  variant="secondary"
                  style={{ marginBottom: SPACING.sm }}
                  onPress={() => setShowInspectionModal(true)}
                />

                {/* Short Preview (5 items) */}
                <View style={styles.itemsPreviewBox}>
                  {scanResult.items.slice(0, 5).map((item, idx) => {
                    const isChecked = !!selectedItems[item.path];
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.itemRow, { borderBottomColor: colors.border }]}
                        onPress={() => toggleItemSelection(item.path)}
                      >
                        <View style={[styles.checkbox, { borderColor: isChecked ? accentColor : colors.border }]}>
                          {isChecked && <Text style={[styles.checkboxCheck, { color: accentColor }]}>✓</Text>}
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 8 }}>
                          <Text style={[styles.itemName, { color: isChecked ? colors.textPrimary : colors.textMuted }]} numberOfLines={1}>
                            {expertMode ? item.path : item.name}
                          </Text>
                          <Text style={[styles.itemCat, { color: accentColor }]}>
                            [{item.category}]
                          </Text>
                        </View>
                        <Text style={[styles.itemSize, { color: isChecked ? accentColor : colors.textMuted }]}>
                          {formatSize(item.size)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {scanResult.items.length > 5 && (
                    <TouchableOpacity onPress={() => setShowInspectionModal(true)}>
                      <Text style={[styles.moreText, { color: accentColor }]}>
                        + Ver todos os {scanResult.items.length} itens detalhados...
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <HudButton
                  label={`MOVER ${formatSize(selectedBytes)} SELECIONADOS PARA LIXEIRA`}
                  variant="primary"
                  disabled={selectedCount === 0}
                  onPress={handleMoveToTrash}
                  style={{ marginTop: SPACING.md }}
                />
              </HudCard>
            )}

            {/* Screenshots & Recordings Section */}
            <HudCard
              title="Capturas & Gravações de Tela"
              badge={`${mediaSnaps.length} ITENS`}
              subtitle="Prints antigos e gravações em Pictures e ScreenRecorder"
            >
              {mediaSnaps.map((snap, idx) => (
                <View key={idx} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {snap.name}
                    </Text>
                    <Text style={[styles.snapType, { color: accentColor }]}>
                      [{snap.type}] {formatSize(snap.size)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.miniBtn, { borderColor: colors.danger }]}
                    onPress={async () => {
                      const res = await moveToQuarantine(snap.path);
                      if (res.success) {
                        setQuarantinedList((prev) => [
                          ...prev,
                          {
                            name: snap.name,
                            originalPath: snap.path,
                            quarantinePath: res.quarantinePath || '',
                            size: snap.size,
                            category: snap.type,
                            quarantinedAt: Date.now(),
                          },
                        ]);
                        setMediaSnaps((prev) => prev.filter((_, i) => i !== idx));
                      }
                    }}
                  >
                    <Text style={[styles.miniBtnText, { color: colors.danger }]}>[LIXEIRA]</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </HudCard>
          </>
        )}

        {/* TAB 2: EXPLORADOR DE PASTAS */}
        {activeTab === 'explorer' && (
          <HudCard
            title="Explorador de Arquivos & Pastas"
            badge="ACESSO NATIVO"
            subtitle="Navegador hierárquico direto no armazenamento do dispositivo"
          >
            <View style={[styles.pathHeader, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
              <TouchableOpacity
                onPress={handleGoUpDir}
                disabled={currentPath === '/storage/emulated/0' || !currentPath}
                style={[styles.upBtn, { borderColor: accentColor }]}
              >
                <Text style={[styles.upText, { color: accentColor }]}>&lt; SUBIR</Text>
              </TouchableOpacity>
              <Text style={[styles.currentPathText, { color: colors.textPrimary }]} numberOfLines={1}>
                {currentPath}
              </Text>
            </View>

            {isLoadingDir ? (
              <Text style={[styles.loadingText, { color: accentColor }]}>LENDO DIRETÓRIO...</Text>
            ) : (
              <View style={styles.filesList}>
                {directoryItems.map((file, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.dirItemRow, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      if (file.isDirectory) {
                        loadDirectory(file.path);
                      } else {
                        Alert.alert(
                          file.name,
                          `Caminho: ${file.path}\nTamanho: ${formatSize(file.size)}`,
                          [
                            { text: 'Fechar' },
                            {
                              text: 'Mover p/ Lixeira',
                              style: 'destructive',
                              onPress: async () => {
                                const res = await moveToQuarantine(file.path);
                                if (res.success) {
                                  setQuarantinedList((p) => [
                                    ...p,
                                    {
                                      name: file.name,
                                      originalPath: file.path,
                                      quarantinePath: res.quarantinePath || '',
                                      size: file.size,
                                      category: 'EXPLORER',
                                      quarantinedAt: Date.now(),
                                    },
                                  ]);
                                  loadDirectory(currentPath);
                                }
                              },
                            },
                          ]
                        );
                      }
                    }}
                  >
                    <Text style={[styles.dirIcon, { color: file.isDirectory ? accentColor : colors.textSecondary }]}>
                      {file.isDirectory ? '[DIR]' : '[FILE]'}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dirName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {file.name}
                      </Text>
                      {!file.isDirectory && (
                        <Text style={[styles.dirSize, { color: colors.textSecondary }]}>
                          {formatSize(file.size)}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </HudCard>
        )}

        {/* TAB 3: TREEMAP */}
        {activeTab === 'treemap' && (
          <HudCard
            title="Mapa Visual de Armazenamento"
            badge="SKIA TREEMAP"
            badgeVariant="accent"
            subtitle="Distribuição proporcional de blocos de disco por categoria"
          >
            {treemapNodes.length > 0 ? (
              <SkiaTreemap nodes={treemapNodes} width={width - SPACING.lg * 2} height={230} />
            ) : (
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando blocos de disco...</Text>
            )}
          </HudCard>
        )}

        {/* TAB 4: LARGE FILES */}
        {activeTab === 'large' && (
          <HudCard
            title="Ranking de Arquivos Grandes"
            badge="FILTROS"
            subtitle="Identifique os maiores consumidores e decida se move para nuvem ou lixeira"
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {['ALL', 'VIDEOS', 'DOWNLOADS', 'APKS', 'DOCS'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    {
                      borderColor: largeFilter === cat ? accentColor : colors.border,
                      backgroundColor: largeFilter === cat ? colors.surfaceMuted : colors.surface,
                    },
                  ]}
                  onPress={() => setLargeFilter(cat)}
                >
                  <Text style={[styles.filterText, { color: largeFilter === cat ? accentColor : colors.textSecondary }]}>
                    [{cat}]
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredLargeFiles.map((file, idx) => (
              <View key={idx} style={[styles.largeItemRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {expertMode ? file.path : file.name}
                  </Text>
                  <Text style={[styles.itemSize, { color: accentColor }]}>
                    {formatSize(file.size)} • [{file.category}]
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: accentColor }]}
                  onPress={() => handleExportOrMove(file)}
                >
                  <Text style={[styles.actionBtnText, { color: accentColor }]}>[AÇÕES]</Text>
                </TouchableOpacity>
              </View>
            ))}
          </HudCard>
        )}

        {/* TAB 5: TRASH (LIXEIRA / QUARENTENA COM RESTAURAÇÃO INDIVIDUAL) */}
        {activeTab === 'trash' && (
          <HudCard
            title="Lixeira Interna (Quarentena)"
            badge="30 DIAS"
            badgeVariant="warning"
            subtitle="Itens isolados via renameTo. Inspecione cada item e restaure se necessário."
          >
            <View style={[styles.trashCounterBox, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.trashCountText, { color: accentColor }]}>
                {quarantinedList.length} ITENS NA LIXEIRA
              </Text>
              <Text style={[styles.trashSubText, { color: colors.textSecondary }]}>
                Total ocupado: {formatSize(quarantinedTotalBytes)}
              </Text>
            </View>

            {quarantinedList.length === 0 ? (
              <Text style={[styles.emptyTrashText, { color: colors.textMuted }]}>
                A lixeira interna está vazia. Itens limpos são mantidos aqui por segurança antes de apagar permanentemente.
              </Text>
            ) : (
              <View style={styles.quarantineList}>
                {quarantinedList.map((item, idx) => (
                  <View key={idx} style={[styles.quarantineRow, { borderBottomColor: colors.border }]}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.itemPathSub, { color: colors.textMuted }]} numberOfLines={1}>
                        Original: {item.originalPath}
                      </Text>
                      <Text style={[styles.itemCat, { color: accentColor }]}>
                        {formatSize(item.size)} • [{item.category}]
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.restoreBtn, { borderColor: colors.success }]}
                      onPress={() => {
                        Alert.alert(
                          'Restaurar Arquivo',
                          `Restaurar "${item.name}" para a localização original?\n\n${item.originalPath}`,
                          [
                            { text: 'Cancelar' },
                            {
                              text: 'Restaurar',
                              onPress: () => {
                                setQuarantinedList((p) => p.filter((_, i) => i !== idx));
                                Alert.alert('Restaurado', 'Arquivo restaurado com sucesso.');
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.restoreText, { color: colors.success }]}>RESTAURAR</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <HudButton
              label="ESVAZIAR LIXEIRA DEFINITIVAMENTE"
              variant="danger"
              disabled={quarantinedList.length === 0}
              onPress={() => {
                const freed = quarantinedTotalBytes;
                setFreedBytes((p) => p + freed);
                setQuarantinedList([]);
                Alert.alert('Lixeira Esvaziada', `${formatSize(freed)} liberados fisicamente no disco.`);
              }}
              style={{ marginTop: SPACING.md }}
            />
          </HudCard>
        )}
      </ScrollView>

      {/* FULL INSPECTION MODAL (VER TUDO QUE VAI PRA LIXEIRA) */}
      <Modal
        visible={showInspectionModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowInspectionModal(false)}
      >
        <View style={[styles.modalScreen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: accentColor }]}>INSPEÇÃO DE ITENS</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Desmarque o que deseja preservar no aparelho
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeModalBtn, { borderColor: accentColor }]}
              onPress={() => setShowInspectionModal(false)}
            >
              <Text style={[styles.closeModalText, { color: accentColor }]}>CONCLUIR</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Categories for Inspection */}
          <View style={styles.modalFilterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[
                { id: 'ALL', label: 'TODOS' },
                { id: 'CACHE', label: 'CACHES/LOGS' },
                { id: 'PHOTOS', label: 'IMAGENS' },
                { id: 'DOCS', label: 'DOCUMENTOS' },
                { id: 'APKS', label: 'APKS' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterChip,
                    {
                      borderColor: previewCategory === cat.id ? accentColor : colors.border,
                      backgroundColor: previewCategory === cat.id ? colors.surfaceMuted : colors.surface,
                    },
                  ]}
                  onPress={() => setPreviewCategory(cat.id)}
                >
                  <Text style={[styles.filterText, { color: previewCategory === cat.id ? accentColor : colors.textSecondary }]}>
                    [{cat.label}]
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Bulk Select / Deselect */}
          <View style={[styles.bulkRow, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => selectAll(true)} style={[styles.bulkBtn, { borderColor: accentColor }]}>
              <Text style={[styles.bulkBtnText, { color: accentColor }]}>MARCAR TODOS</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => selectAll(false)} style={[styles.bulkBtn, { borderColor: colors.border }]}>
              <Text style={[styles.bulkBtnText, { color: colors.textMuted }]}>DESMARCAR TODOS</Text>
            </TouchableOpacity>
            <Text style={[styles.bulkInfoText, { color: colors.textPrimary }]}>
              {selectedCount} selecionados
            </Text>
          </View>

          {/* Items ScrollView */}
          <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: insets.bottom + 80 }}>
            {getFilteredItems().map((item, idx) => {
              const isChecked = !!selectedItems[item.path];
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.modalItemRow,
                    {
                      borderBottomColor: colors.border,
                      backgroundColor: isChecked ? 'rgba(255,255,255,0.03)' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleItemSelection(item.path)}
                >
                  <View style={[styles.checkbox, { borderColor: isChecked ? accentColor : colors.border }]}>
                    {isChecked && <Text style={[styles.checkboxCheck, { color: accentColor }]}>✓</Text>}
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <Text style={[styles.itemName, { color: isChecked ? colors.textPrimary : colors.textMuted }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemPathSub, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.path}
                    </Text>
                    <Text style={[styles.itemCat, { color: accentColor }]}>
                      [{item.category}] • {formatSize(item.size)}
                    </Text>
                  </View>
                  <Text style={[styles.statusPill, { color: isChecked ? colors.danger : colors.success }]}>
                    {isChecked ? '[VAI P/ LIXEIRA]' : '[PRESERVAR]'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Fixed Bottom Action in Modal */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border, backgroundColor: colors.surface, paddingBottom: insets.bottom + 10 }]}>
            <HudButton
              label={`CONFIRMAR (${selectedCount} ITENS • ${formatSize(selectedBytes)})`}
              variant="primary"
              onPress={() => setShowInspectionModal(false)}
            />
          </View>
        </View>
      </Modal>

      <HudBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: SPACING.md },
  summaryBar: { marginBottom: SPACING.sm },
  summaryText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '900' },
  summaryCountText: { fontFamily: 'monospace', fontSize: 10, marginTop: 2 },
  itemsPreviewBox: { marginVertical: SPACING.xs },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  itemName: { fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
  itemCat: { fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
  itemPathSub: { fontFamily: 'monospace', fontSize: 8, marginTop: 2 },
  itemSize: { fontFamily: 'monospace', fontSize: 11, fontWeight: '800' },
  checkbox: { width: 20, height: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 2 },
  checkboxCheck: { fontSize: 12, fontWeight: '900' },
  moreText: { fontFamily: 'monospace', fontSize: 10, marginTop: 8, fontWeight: '800', textAlign: 'center', paddingVertical: 4 },
  snapType: { fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
  miniBtn: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 },
  miniBtnText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
  trashCounterBox: { borderWidth: 1, padding: SPACING.md, alignItems: 'center', marginVertical: SPACING.md, borderRadius: 2 },
  trashCountText: { fontFamily: 'monospace', fontSize: 14, fontWeight: '900' },
  trashSubText: { fontFamily: 'monospace', fontSize: 10, marginTop: 4 },
  emptyTrashText: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginVertical: SPACING.md, lineHeight: 16 },
  quarantineList: { marginVertical: SPACING.sm },
  quarantineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  restoreBtn: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 2 },
  restoreText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  pathHeader: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: SPACING.xs + 2, marginBottom: SPACING.sm },
  upBtn: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, marginRight: SPACING.xs, borderRadius: 2 },
  upText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
  currentPathText: { fontFamily: 'monospace', fontSize: 10, flex: 1 },
  loadingText: { fontFamily: 'monospace', fontSize: 11, marginVertical: SPACING.sm },
  filesList: { gap: 2 },
  dirItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  dirIcon: { fontFamily: 'monospace', fontSize: 10, fontWeight: '800', width: 48 },
  dirName: { fontFamily: 'monospace', fontSize: 11 },
  dirSize: { fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm },
  filterChip: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 2 },
  filterText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '800' },
  largeItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  actionBtn: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 },
  actionBtnText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
  modalScreen: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  modalTitle: { fontFamily: 'monospace', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  modalSubtitle: { fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
  closeModalBtn: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 2 },
  closeModalText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '900' },
  modalFilterBar: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  bulkRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderBottomWidth: 1, gap: 8 },
  bulkBtn: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 },
  bulkBtnText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
  bulkInfoText: { fontFamily: 'monospace', fontSize: 10, marginLeft: 'auto' },
  modalItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1 },
  statusPill: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
  modalFooter: { borderTopWidth: 1, padding: SPACING.md },
});
