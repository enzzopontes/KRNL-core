import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { HudHeader } from '../components/HudHeader';
import { HudBottomBar } from '../components/HudBottomBar';
import { HudSegmentedControl, SegmentOption } from '../components/HudSegmentedControl';
import { SPACING, radius } from '../design/tokens';
import {
  scanExactDuplicates,
  scanSimilarPhotos,
  scanBlurryPhotos,
  DuplicateGroup,
  SimilarPhotoGroup,
  BlurryPhoto,
} from '../../modules/krnl-duplicates';
import { moveToQuarantine } from '../../modules/krnl-storage';
import { requestStandardStoragePermissions } from '../services/permissions';

type DuplicatesTab = 'exact' | 'similar' | 'blurry';

export default function DuplicatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor, isPro, expertMode } = useThemeStore();
  const colors = getColors();

  const [activeTab, setActiveTab] = useState<DuplicatesTab>('exact');
  const [isScanning, setIsScanning] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [similarGroups, setSimilarGroups] = useState<SimilarPhotoGroup[]>([]);
  const [blurryPhotos, setBlurryPhotos] = useState<BlurryPhoto[]>([]);
  const [blurSensitivity, setBlurSensitivity] = useState<'LOW' | 'NORMAL' | 'HIGH'>('NORMAL');

  const [selectedToKeep, setSelectedToKeep] = useState<Record<string, string>>({});
  const [hasScanned, setHasScanned] = useState<Record<DuplicatesTab, boolean>>({
    exact: false,
    similar: false,
    blurry: false,
  });

  const isAndroid14OrHigher = Platform.OS === 'android' && Platform.Version >= 34;

  const handleScanExact = async () => {
    await requestStandardStoragePermissions();
    setIsScanning(true);
    try {
      const result = await scanExactDuplicates([]);
      setDuplicateGroups(result.groups || []);
      setHasScanned((p) => ({ ...p, exact: true }));

      const initialKeep: Record<string, string> = {};
      (result.groups || []).forEach((group) => {
        const best = group.files.find((f) => f.includes('/DCIM/')) || group.files[0];
        initialKeep[group.hash] = best;
      });
      setSelectedToKeep(initialKeep);
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanSimilar = async () => {
    if (!isPro) {
      Alert.alert(
        'Recurso KRNL PRO',
        'A detecção perceptual de fotos similares via dHash 64-bit requer licença KRNL PRO.',
        [
          { text: 'Agora não' },
          { text: 'Conhecer PRO', onPress: () => router.push('/subscription') },
        ]
      );
      return;
    }
    await requestStandardStoragePermissions();
    setIsScanning(true);
    try {
      const res = await scanSimilarPhotos([], 10);
      setSimilarGroups(res || []);
      setHasScanned((p) => ({ ...p, similar: true }));
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanBlurry = async () => {
    await requestStandardStoragePermissions();
    setIsScanning(true);
    try {
      const threshold = blurSensitivity === 'LOW' ? 60.0 : blurSensitivity === 'NORMAL' ? 100.0 : 150.0;
      const res = await scanBlurryPhotos(threshold, []);
      setBlurryPhotos(res || []);
      setHasScanned((p) => ({ ...p, blurry: true }));
    } finally {
      setIsScanning(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImageFile = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext || '');
  };

  const handleCleanDuplicates = (group: DuplicateGroup) => {
    const keepPath = selectedToKeep[group.hash];
    const toRemove = group.files.filter((f) => f !== keepPath);

    Alert.alert(
      'Mover Duplicadas para Lixeira (Quarentena)',
      `Manter original:\n${keepPath}\n\nMover ${toRemove.length} cópia(s) para a lixeira?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            for (const file of toRemove) {
              await moveToQuarantine(file);
            }
            setDuplicateGroups((prev) => prev.filter((g) => g.hash !== group.hash));
            Alert.alert('Sucesso', 'Cópias movidas para a lixeira com segurança.');
          },
        },
      ]
    );
  };

  const handleCleanBlurryPhoto = async (photo: BlurryPhoto) => {
    await moveToQuarantine(photo.path);
    setBlurryPhotos((prev) => prev.filter((p) => p.path !== photo.path));
    Alert.alert('Lixeira', 'Foto borrada movida para quarentena.');
  };

  const tabOptions: SegmentOption<DuplicatesTab>[] = [
    { id: 'exact', label: 'Exatas xxHash' },
    { id: 'similar', label: 'Semelhantes', badge: 'PRO' },
    { id: 'blurry', label: 'Tremidas' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <HudHeader showBack title="DUPLICADAS // xxHASH" subtitle="DETECÇÃO NATIVA & DHASH" />

      <View style={{ paddingHorizontal: SPACING.md }}>
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
        {isAndroid14OrHigher && (
          <HudCard
            title="Aviso Android 14+ // Permissão Parcial"
            badge="ATENÇÃO"
            badgeVariant="warning"
            subtitle="Se concedeu acesso apenas a algumas fotos, o scanner não verá a galeria completa."
          >
            <HudButton
              label="REVISAR PERMISSÃO DE FOTOS"
              variant="secondary"
              onPress={() => router.push('/onboarding')}
            />
          </HudCard>
        )}

        {/* TAB 1: EXACT DUPLICATES (xxHash64) */}
        {activeTab === 'exact' && (
          <>
            <HudCard
              title="Algoritmo xxHash64 em 3 Etapas"
              badge="100% LOCAL"
              badgeVariant="accent"
              subtitle="Tamanho exato -> Hash parcial 16KB -> Hash integral dos candidatos"
            >
              <HudButton
                label={isScanning ? 'EXECUTANDO xxHash64...' : 'LOCALIZAR ARQUIVOS DUPLICADOS'}
                variant="primary"
                loading={isScanning}
                onPress={handleScanExact}
              />
            </HudCard>

            {hasScanned.exact && duplicateGroups.length === 0 && !isScanning && (
              <HudCard title="Varredura Concluída" badge="0 DUPLICADAS" badgeVariant="ok">
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Nenhum arquivo 100% idêntico encontrado nas fotos ou armazenamento. O dispositivo já está otimizado!
                </Text>
              </HudCard>
            )}

            {duplicateGroups.length > 0 && (
              <HudCard
                title={`Grupos Detectados (${duplicateGroups.length})`}
                badge="ESCOLHA O ORIGINAL"
                highlight
              >
                {duplicateGroups.map((group) => {
                  const keepFile = selectedToKeep[group.hash];
                  return (
                    <View key={group.hash} style={[styles.groupCard, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
                      <View style={styles.groupHeader}>
                        <Text style={[styles.hashLabel, { color: colors.textSecondary }]}>
                          xxHash64: {group.hash.substring(0, 16)}...
                        </Text>
                        <Text style={[styles.groupSize, { color: accentColor }]}>
                          {formatSize(group.size)} CADA
                        </Text>
                      </View>

                      <Text style={[styles.subLabel, { color: colors.textPrimary }]}>
                        ITENS ENCONTRADOS ({group.files.length}):
                      </Text>

                      {group.files.map((file) => {
                        const isKept = keepFile === file;
                        const isImg = isImageFile(file);
                        return (
                          <TouchableOpacity
                            key={file}
                            style={[
                              styles.fileChoice,
                              {
                                borderColor: isKept ? accentColor : colors.border,
                                backgroundColor: isKept ? 'rgba(255,255,255,0.06)' : colors.surface,
                              },
                            ]}
                            onPress={() =>
                              setSelectedToKeep((prev) => ({ ...prev, [group.hash]: file }))
                            }
                          >
                            {/* Visual Thumbnail if Image */}
                            {isImg ? (
                              <Image
                                source={{ uri: `file://${file}` }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={[styles.fileIconBox, { backgroundColor: colors.surfaceMuted }]}>
                                <Text style={[styles.fileIconText, { color: accentColor }]}>DOC</Text>
                              </View>
                            )}

                            <View style={{ flex: 1, marginHorizontal: 10 }}>
                              <Text numberOfLines={1} style={[styles.filePath, { color: colors.textPrimary }]}>
                                {expertMode ? file : file.split('/').pop()}
                              </Text>
                              <Text numberOfLines={1} style={[styles.pathSub, { color: colors.textMuted }]}>
                                {file}
                              </Text>
                              {file.includes('/DCIM/') && (
                                <Text style={[styles.recTag, { color: colors.success }]}>
                                  [RECOMENDADO: CÂMERA DCIM ORIGINAL]
                                </Text>
                              )}
                            </View>

                            <View style={[styles.statusBadge, { borderColor: isKept ? accentColor : colors.danger }]}>
                              <Text style={[styles.statusTag, { color: isKept ? accentColor : colors.danger }]}>
                                {isKept ? 'MANTER' : 'LIXEIRA'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}

                      <HudButton
                        label="ISOLAR CÓPIAS NA LIXEIRA"
                        variant="secondary"
                        style={{ marginTop: SPACING.sm }}
                        onPress={() => handleCleanDuplicates(group)}
                      />
                    </View>
                  );
                })}
              </HudCard>
            )}
          </>
        )}

        {/* TAB 2: SIMILAR PHOTOS (dHash) */}
        {activeTab === 'similar' && (
          <HudCard
            title="Detecção Perceptual de Fotos (dHash)"
            badge="PRO"
            badgeVariant="accent"
            subtitle="Compara fotos em sequência ou ângulos parecidos usando gradiente 8x8"
          >
            <HudButton
              label={isScanning ? 'PROCESSANDO dHash...' : 'ANALISAR FOTOS SIMILARES (PRO)'}
              variant="primary"
              loading={isScanning}
              onPress={handleScanSimilar}
            />

            {hasScanned.similar && similarGroups.length === 0 && !isScanning && (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Nenhuma sequência de fotos parecidas encontrada na galeria.
              </Text>
            )}

            {similarGroups.map((group, idx) => {
              const filesList = (group as any).similarPaths || group.files?.map((f) => f.path) || [];
              return (
                <View key={idx} style={[styles.groupCard, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.subLabel, { color: colors.textPrimary }]}>
                    GRUPO SIMILAR #{idx + 1} ({filesList.length} fotos parecidas)
                  </Text>
                  
                  {/* Thumbnails Grid Preview */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                    {filesList.map((path: string, pIdx: number) => (
                      <View key={pIdx} style={styles.similarThumbWrap}>
                        <Image source={{ uri: `file://${path}` }} style={styles.similarThumb} resizeMode="cover" />
                        <Text numberOfLines={1} style={[styles.thumbName, { color: colors.textSecondary }]}>
                          {path.split('/').pop()}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </HudCard>
        )}

        {/* TAB 3: BLURRY PHOTOS */}
        {activeTab === 'blurry' && (
          <HudCard
            title="Detecção de Fotos Tremidas / Borradas"
            badge="LAPLACIANO"
            subtitle="Filtro de variância do Laplaciano para fotos com desfoque de movimento"
          >
            <View style={styles.sensRow}>
              <Text style={[styles.sensLabel, { color: colors.textSecondary }]}>SENSIBILIDADE:</Text>
              {(['LOW', 'NORMAL', 'HIGH'] as const).map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.sensBtn,
                    {
                      borderColor: blurSensitivity === lvl ? accentColor : colors.border,
                      backgroundColor: blurSensitivity === lvl ? colors.surfaceAlt : colors.surface,
                    },
                  ]}
                  onPress={() => setBlurSensitivity(lvl)}
                >
                  <Text style={[styles.sensText, { color: blurSensitivity === lvl ? accentColor : colors.textSecondary }]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <HudButton
              label={isScanning ? 'ANALISANDO NITIDEZ...' : 'VARREDURA DE FOTOS BORRADAS'}
              variant="primary"
              loading={isScanning}
              onPress={handleScanBlurry}
            />

            {hasScanned.blurry && blurryPhotos.length === 0 && !isScanning && (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Todas as fotos analisadas estão nítidas. Nenhuma foto tremida encontrada!
              </Text>
            )}

            {blurryPhotos.map((photo, idx) => (
              <View key={idx} style={[styles.blurryRow, { borderBottomColor: colors.border }]}>
                <Image source={{ uri: `file://${photo.path}` }} style={styles.thumbnail} resizeMode="cover" />
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text numberOfLines={1} style={[styles.filePath, { color: colors.textPrimary }]}>
                    {photo.path.split('/').pop()}
                  </Text>
                  <Text style={[styles.blurScore, { color: colors.warning }]}>
                    Nitidez: {photo.blurScore.toFixed(1)} • {formatSize(photo.size)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.miniBtn, { borderColor: colors.danger }]}
                  onPress={() => handleCleanBlurryPhoto(photo)}
                >
                  <Text style={[styles.miniBtnText, { color: colors.danger }]}>[LIXEIRA]</Text>
                </TouchableOpacity>
              </View>
            ))}
          </HudCard>
        )}
      </ScrollView>

      <HudBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: SPACING.md },
  groupCard: { borderWidth: 1, padding: SPACING.md, marginVertical: SPACING.sm, borderRadius: radius.card },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  hashLabel: { fontFamily: 'monospace', fontSize: 9 },
  groupSize: { fontFamily: 'monospace', fontSize: 10, fontWeight: '800' },
  subLabel: { fontFamily: 'monospace', fontSize: 10, fontWeight: '800', marginVertical: SPACING.xs },
  fileChoice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, padding: SPACING.sm, marginVertical: 4, borderRadius: radius.sm },
  thumbnail: { width: 44, height: 44, borderRadius: radius.xs, backgroundColor: '#1A1A1A' },
  fileIconBox: { width: 44, height: 44, borderRadius: radius.xs, justifyContent: 'center', alignItems: 'center' },
  fileIconText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '900' },
  filePath: { fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
  pathSub: { fontFamily: 'monospace', fontSize: 8, marginTop: 1 },
  recTag: { fontFamily: 'monospace', fontSize: 8, marginTop: 2, fontWeight: '700' },
  statusBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 3, borderRadius: radius.xs },
  statusTag: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
  emptyText: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginVertical: SPACING.md, lineHeight: 16 },
  similarThumbWrap: { marginRight: 10, alignItems: 'center', width: 68 },
  similarThumb: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: '#1A1A1A' },
  thumbName: { fontFamily: 'monospace', fontSize: 8, marginTop: 4, textAlign: 'center' },
  sensRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: SPACING.sm },
  sensLabel: { fontFamily: 'monospace', fontSize: 10, fontWeight: '700' },
  sensBtn: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm },
  sensText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
  blurryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  blurScore: { fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
  miniBtn: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  miniBtnText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '800' },
});
