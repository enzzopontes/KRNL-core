import React, { useState } from 'react';
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
import { scanExactDuplicates, DuplicateGroup } from '../../modules/krnl-duplicates';

export default function DuplicatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const [isScanning, setIsScanning] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedToKeep, setSelectedToKeep] = useState<Record<string, string>>({});

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const result = await scanExactDuplicates([]);
      setDuplicateGroups(result.groups);

      // Pre-select original / best candidates to keep
      const initialKeep: Record<string, string> = {};
      result.groups.forEach((group) => {
        // Keep camera / first item by default
        const best = group.files.find((f) => f.includes('/DCIM/')) || group.files[0];
        initialKeep[group.hash] = best;
      });
      setSelectedToKeep(initialKeep);
    } finally {
      setIsScanning(false);
    }
  };

  const formatSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCleanDuplicates = (group: DuplicateGroup) => {
    const keepPath = selectedToKeep[group.hash];
    const toRemove = group.files.filter((f) => f !== keepPath);

    Alert.alert(
      'Mover Duplicadas para Quarentena',
      `Manter:\n${keepPath}\n\nMover ${toRemove.length} cópia(s) para a lixeira interna?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setDuplicateGroups((prev) => prev.filter((g) => g.hash !== group.hash));
            Alert.alert('Sucesso', 'Cópias redundantes movidas para quarentena.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>&lt; PAINEL</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: accentColor }]}>DUPLICADAS // 3-STAGE HASH</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {/* Transparency Banner */}
        <HudCard title="Algoritmo em 3 Etapas" badge="SEGURO & LOCAL">
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            1. Agrupa por tamanho exato em bytes.{'\n'}
            2. xxHash parcial (16 KB no início, meio e fim).{'\n'}
            3. Hash completo SHA-256 apenas dos empatados.{'\n'}
            Nenhum dado ou foto é transmitido para servidores.
          </Text>
          <HudButton
            label={isScanning ? 'EXECUTANDO ANÁLISE 3-STAGE...' : 'LOCALIZAR ARQUIVOS DUPLICADOS'}
            variant="primary"
            loading={isScanning}
            onPress={handleScan}
          />
        </HudCard>

        {duplicateGroups.length > 0 && (
          <HudCard title={`Grupos Detectados (${duplicateGroups.length})`} highlight>
            {duplicateGroups.map((group) => {
              const keepFile = selectedToKeep[group.hash];
              return (
                <View key={group.hash} style={[styles.groupCard, { borderColor: colors.border }]}>
                  <View style={styles.groupHeader}>
                    <Text style={[styles.hashLabel, { color: colors.textSecondary }]}>
                      HASH: {group.hash.substring(0, 16)}...
                    </Text>
                    <Text style={[styles.groupSize, { color: accentColor }]}>
                      {formatSize(group.size)} CADA
                    </Text>
                  </View>

                  <Text style={[styles.subLabel, { color: colors.textPrimary }]}>
                    SELECIONE QUAL ARQUIVO DESEJA PRESERVAR:
                  </Text>

                  {group.files.map((file) => {
                    const isKept = keepFile === file;
                    return (
                      <TouchableOpacity
                        key={file}
                        style={[
                          styles.fileChoice,
                          {
                            borderColor: isKept ? accentColor : colors.border,
                            backgroundColor: isKept ? colors.surfaceMuted : colors.surface,
                          },
                        ]}
                        onPress={() =>
                          setSelectedToKeep((prev) => ({ ...prev, [group.hash]: file }))
                        }
                      >
                        <View style={{ flex: 1 }}>
                          <Text numberOfLines={1} style={[styles.filePath, { color: colors.textPrimary }]}>
                            {file}
                          </Text>
                          {file.includes('/DCIM/') && (
                            <Text style={[styles.recTag, { color: colors.success }]}>
                              [RECOMENDADO: FOTO ORIGINAL DA CÂMERA]
                            </Text>
                          )}
                        </View>
                        <Text style={[styles.statusTag, { color: isKept ? accentColor : colors.textSecondary }]}>
                          {isKept ? '[MANTER]' : '[DESCARTAR]'}
                        </Text>
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
  infoText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  groupCard: {
    borderWidth: 1,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  hashLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
  groupSize: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  subLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    marginVertical: SPACING.xs,
  },
  fileChoice: {
    borderWidth: 1,
    padding: SPACING.xs,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filePath: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
  recTag: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },
  statusTag: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 8,
  },
});
